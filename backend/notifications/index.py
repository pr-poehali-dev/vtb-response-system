import json
import os
import psycopg2
import requests
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для управления уведомлениями банка ВТБ'''
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
        query_params = event.get('queryStringParameters', {}) or {}
        user_id = query_params.get('user_id')
        
        if user_id:
            cur.execute("""
                SELECT id, title, message, notification_type, is_read, 
                       sent_at, read_at 
                FROM notifications 
                WHERE user_id = %s 
                ORDER BY sent_at DESC
            """, (user_id,))
        else:
            cur.execute("""
                SELECT n.id, n.title, n.message, n.notification_type, 
                       n.is_read, n.sent_at, n.read_at, u.phone, u.full_name
                FROM notifications n
                JOIN users u ON n.user_id = u.id
                ORDER BY n.sent_at DESC
                LIMIT 100
            """)
        
        rows = cur.fetchall()
        
        if user_id:
            notifications = [{
                'id': row[0],
                'title': row[1],
                'message': row[2],
                'type': row[3],
                'isRead': row[4],
                'sentAt': row[5].isoformat() if row[5] else None,
                'readAt': row[6].isoformat() if row[6] else None
            } for row in rows]
        else:
            notifications = [{
                'id': row[0],
                'title': row[1],
                'message': row[2],
                'type': row[3],
                'isRead': row[4],
                'sentAt': row[5].isoformat() if row[5] else None,
                'readAt': row[6].isoformat() if row[6] else None,
                'phone': row[7],
                'fullName': row[8]
            } for row in rows]
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'notifications': notifications}),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'send':
            phone = body.get('phone')
            title = body.get('title')
            message = body.get('message')
            notif_type = body.get('type', 'info')
            
            cur.execute("SELECT id, telegram_id FROM users WHERE phone = %s", (phone,))
            user_row = cur.fetchone()
            
            if not user_row:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь не найден'}),
                    'isBase64Encoded': False
                }
            
            user_id, telegram_id = user_row
            
            cur.execute("""
                INSERT INTO notifications (user_id, title, message, notification_type)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, (user_id, title, message, notif_type))
            
            notif_id = cur.fetchone()[0]
            conn.commit()
            
            telegram_sent = False
            if telegram_id:
                bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
                if bot_token:
                    telegram_text = f"🏦 *{title}*\n\n{message}\n\n_Банк ВТБ_"
                    telegram_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                    
                    response = requests.post(telegram_url, json={
                        'chat_id': telegram_id,
                        'text': telegram_text,
                        'parse_mode': 'Markdown'
                    })
                    
                    telegram_sent = response.status_code == 200
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'notificationId': notif_id,
                    'telegramSent': telegram_sent
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'mark_read':
            notif_id = body.get('notificationId')
            
            cur.execute("""
                UPDATE notifications 
                SET is_read = TRUE, read_at = %s 
                WHERE id = %s
            """, (datetime.now(), notif_id))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
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