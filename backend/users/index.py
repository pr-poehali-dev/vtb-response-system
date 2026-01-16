import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для управления пользователями банка'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA')
    
    conn = psycopg2.connect(db_url, options=f'-c search_path={schema}')
    cur = conn.cursor()
    
    if method == 'GET':
        cur.execute("""
            SELECT u.id, u.phone, u.full_name, u.telegram_id, u.created_at,
                   COUNT(n.id) as notification_count
            FROM users u
            LEFT JOIN notifications n ON u.id = n.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        """)
        
        rows = cur.fetchall()
        users = [{
            'id': row[0],
            'phone': row[1],
            'fullName': row[2],
            'telegramId': row[3],
            'createdAt': row[4].isoformat() if row[4] else None,
            'notificationCount': row[5]
        } for row in rows]
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'users': users}),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        phone = body.get('phone')
        full_name = body.get('fullName')
        telegram_id = body.get('telegramId')
        
        cur.execute("""
            INSERT INTO users (phone, full_name, telegram_id)
            VALUES (%s, %s, %s)
            RETURNING id
        """, (phone, full_name, telegram_id))
        
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'userId': user_id
            }),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }