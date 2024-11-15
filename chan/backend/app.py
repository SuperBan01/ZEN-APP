from openai import OpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import logging
from datetime import datetime, timedelta
from collections import defaultdict

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 配置 OpenAI 客户端
client = OpenAI(
    api_key="oTPbBhkIoGVJRqQ1r4k9kM5uWbAnuHbR2EcDarAIX5jgejvrSgV0lgGFcZjweF1t",
    base_url="https://api.stepfun.com/v1"
)

# 用户对话次数记录
chat_counts = defaultdict(lambda: {'count': 0, 'last_reset': datetime.now()})
MAX_DAILY_CHATS = 3

# 添加用户数据存储
user_stats = defaultdict(lambda: {
    'meditation_count': 0,
    'streak_days': 0,
    'chat_count': 0,
    'last_meditation': None,
    'last_streak_check': datetime.now().date()
})

def get_remaining_chats(user_id):
    user_data = chat_counts[user_id]
    now = datetime.now()
    
    # 如果是新的一天，重置计数
    if now.date() > user_data['last_reset'].date():
        user_data['count'] = 0
        user_data['last_reset'] = now
    
    return MAX_DAILY_CHATS - user_data['count']

def update_streak(user_id):
    """更新用户的持续打卡天数"""
    user_data = user_stats[user_id]
    today = datetime.now().date()
    
    # 如果是第一次打卡
    if user_data['last_meditation'] is None:
        user_data['streak_days'] = 1
        user_data['last_meditation'] = today
        return
    
    last_meditation = user_data['last_meditation']
    
    # 如果今天已经打卡过，不重复计算
    if last_meditation == today:
        return
        
    # 如果是连续打卡
    if (today - last_meditation).days == 1:
        user_data['streak_days'] += 1
    # 如果中断了打卡
    elif (today - last_meditation).days > 1:
        user_data['streak_days'] = 1
    
    user_data['last_meditation'] = today

@app.route('/api/master/chat', methods=['POST'])
def chat_with_master():
    try:
        message = request.json.get('message')
        user_id = request.json.get('user_id', 'default_user')
        
        if not message:
            return jsonify({'error': '消息不能为空'}), 400
        
        # 检查对话次数限制
        remaining_chats = get_remaining_chats(user_id)
        if remaining_chats <= 0:
            return jsonify({
                'error': '今日对话次数已用完，明日再来。',
                'remaining_chats': 0
            }), 429
            
        # 构建消息列表
        messages = [
            {
                "role": "system",
                "content": """你是一位智慧而严厉的禅师，名叫"心一"。你擅长中文对话，专注于禅修指导。
                你应该：
                1. 以平和、富有哲理的方式回答问题
                2. 回答要简短有力，富有禅意，通常每句回复不超过20个字
                3. 经常引用禅宗经典或者禅师语录
                4. 引导用户思考和内省
                5. 使用优雅的中文回答
                6. 拒绝与禅修无关的话题
                7. 保持对话的纯净与专注"""
            },
            {
                "role": "user",
                "content": message
            }
        ]
        
        # 调用 API
        completion = client.chat.completions.create(
            model="step-1-8k",
            messages=messages
        )
        
        # 获取响应内容
        zen_response = completion.choices[0].message.content
        
        # 更新对话计数和统计
        chat_counts[user_id]['count'] += 1
        user_stats[user_id]['chat_count'] += 1
        remaining = get_remaining_chats(user_id)
        
        return jsonify({
            'response': zen_response,
            'status': 'success',
            'remaining_chats': remaining,
            'chat_count': user_stats[user_id]['chat_count']
        })
            
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        return jsonify({
            'error': '禅师暂时无法回应',
            'details': str(e)
        }), 500

@app.route('/api/master/remaining_chats', methods=['GET'])
def get_remaining_chats_route():
    user_id = request.args.get('user_id', 'default_user')
    remaining = get_remaining_chats(user_id)
    return jsonify({
        'remaining_chats': remaining,
        'max_daily_chats': MAX_DAILY_CHATS
    })

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/cultivation/stats', methods=['GET'])
def get_user_stats():
    """获取用户统计数据"""
    user_id = request.args.get('user_id', 'default_user')
    stats = user_stats[user_id]
    return jsonify({
        'meditation_count': stats['meditation_count'],
        'streak_days': stats['streak_days'],
        'chat_count': stats['chat_count']
    })

@app.route('/api/meditation/record', methods=['POST'])
def record_meditation():
    """记录一次冥想"""
    user_id = request.json.get('user_id', 'default_user')
    duration = request.json.get('duration', 0)
    
    user_stats[user_id]['meditation_count'] += 1
    update_streak(user_id)
    
    return jsonify({
        'status': 'success',
        'meditation_count': user_stats[user_id]['meditation_count'],
        'streak_days': user_stats[user_id]['streak_days']
    })

def main():
    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        logger.error(f"Server failed to start: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main() 