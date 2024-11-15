from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import sqlite3
import json

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            priority TEXT NOT NULL,
            date TEXT NOT NULL,
            completed BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            category TEXT DEFAULT 'task',
            description TEXT,
            repeat_type TEXT DEFAULT 'none',
            repeat_value INTEGER DEFAULT 0,
            parent_task_id INTEGER DEFAULT NULL,
            FOREIGN KEY (parent_task_id) REFERENCES tasks (id)
        )
    ''')
    conn.commit()
    conn.close()

# 获取所有任务，支持分页和过滤
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    filter_type = request.args.get('filter', 'all')
    
    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    
    today = datetime.now().strftime('%Y-%m-%d')
    offset = (page - 1) * per_page
    
    base_query = '''
        SELECT id, title, priority, date, completed, created_at, category, description
        FROM tasks
    '''
    
    if filter_type == 'today':
        query = base_query + ' WHERE date = ?'
        params = (today,)
    elif filter_type == 'upcoming':
        query = base_query + ' WHERE date > ?'
        params = (today,)
    elif filter_type == 'past':
        query = base_query + ' WHERE date < ?'
        params = (today,)
    else:
        query = base_query
        params = ()
    
    # 添加排序和分页
    query += ' ORDER BY date DESC, priority DESC LIMIT ? OFFSET ?'
    params = params + (per_page, offset)
    
    c.execute(query, params)
    tasks = c.fetchall()
    
    # 获取总数
    c.execute('SELECT COUNT(*) FROM tasks')
    total = c.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'tasks': [{
            'id': task[0],
            'title': task[1],
            'priority': task[2],
            'date': task[3],
            'completed': bool(task[4]),
            'created_at': task[5],
            'category': task[6],
            'description': task[7]
        } for task in tasks],
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    })

# 添加新任务
@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    
    # 处理重复任务
    if data.get('repeat_type') and data.get('repeat_value'):
        # 创建父任务
        c.execute('''
            INSERT INTO tasks (title, priority, date, category, description, repeat_type, repeat_value)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['title'],
            data['priority'],
            data['date'],
            data.get('category', 'task'),
            data.get('description', ''),
            data['repeat_type'],
            data['repeat_value']
        ))
        parent_id = c.lastrowid
        
        # 创建重复任务实例
        start_date = datetime.strptime(data['date'], '%Y-%m-%d')
        for i in range(data['repeat_value']):
            if data['repeat_type'] == 'daily':
                next_date = start_date + timedelta(days=i+1)
            elif data['repeat_type'] == 'weekly':
                next_date = start_date + timedelta(weeks=i+1)
            elif data['repeat_type'] == 'monthly':
                next_date = start_date + timedelta(days=(i+1)*30)
            
            c.execute('''
                INSERT INTO tasks (title, priority, date, category, description, parent_task_id)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                data['title'],
                data['priority'],
                next_date.strftime('%Y-%m-%d'),
                data.get('category', 'task'),
                data.get('description', ''),
                parent_id
            ))
    else:
        # 创建单次任务
        c.execute('''
            INSERT INTO tasks (title, priority, date, category, description)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['title'],
            data['priority'],
            data['date'],
            data.get('category', 'task'),
            data.get('description', '')
        ))
    
    conn.commit()
    task_id = c.lastrowid
    conn.close()
    
    return jsonify({
        'id': task_id,
        'message': 'Task created successfully'
    }), 201

# 更新任务
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    
    # 检查是否是重复任务的实例
    c.execute('SELECT parent_task_id FROM tasks WHERE id = ?', (task_id,))
    result = c.fetchone()
    parent_id = result[0] if result else None
    
    if parent_id and data.get('update_all'):
        # 更新所有相关任务
        c.execute('''
            UPDATE tasks
            SET title = ?, priority = ?, category = ?, description = ?
            WHERE parent_task_id = ? OR id = ?
        ''', (
            data['title'],
            data['priority'],
            data.get('category', 'task'),
            data.get('description', ''),
            parent_id,
            parent_id
        ))
    else:
        # 更新单个任务
        c.execute('''
            UPDATE tasks
            SET title = ?, priority = ?, date = ?, completed = ?, 
                category = ?, description = ?
            WHERE id = ?
        ''', (
            data['title'],
            data['priority'],
            data['date'],
            data.get('completed', False),
            data.get('category', 'task'),
            data.get('description', ''),
            task_id
        ))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'message': 'Task updated successfully'
    })

# 删除任务
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    
    # 检查是否是重复任务的实例
    c.execute('SELECT parent_task_id FROM tasks WHERE id = ?', (task_id,))
    result = c.fetchone()
    parent_id = result[0] if result else None
    
    if parent_id and request.args.get('delete_all') == 'true':
        # 删除所有相关任务
        c.execute('DELETE FROM tasks WHERE parent_task_id = ? OR id = ?', (parent_id, parent_id))
    else:
        # 删除单个任务
        c.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'message': 'Task deleted successfully'
    })

# 获取任务统计信息
@app.route('/api/tasks/stats', methods=['GET'])
def get_task_stats():
    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    
    today = datetime.now().strftime('%Y-%m-%d')
    
    # 获取各种统计数据
    c.execute('SELECT COUNT(*) FROM tasks WHERE completed = 1')
    completed_total = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM tasks WHERE date = ? AND completed = 0', (today,))
    today_pending = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM tasks WHERE date > ?', (today,))
    upcoming_total = c.fetchone()[0]
    
    c.execute('''
        SELECT priority, COUNT(*) 
        FROM tasks 
        WHERE completed = 0 
        GROUP BY priority
    ''')
    priority_stats = dict(c.fetchall())
    
    conn.close()
    
    return jsonify({
        'completed_total': completed_total,
        'today_pending': today_pending,
        'upcoming_total': upcoming_total,
        'priority_stats': priority_stats
    })

if __name__ == '__main__':
    init_db()
    app.run(debug=True) 