CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    telegram_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);

INSERT INTO users (phone, full_name, telegram_id) VALUES 
('+79991234567', 'Иванов Иван Иванович', NULL),
('+79997654321', 'Петров Петр Петрович', NULL),
('+79995555555', 'Сидорова Мария Александровна', NULL);

INSERT INTO notifications (user_id, title, message, notification_type) VALUES
(1, 'Зачисление средств', 'На ваш счёт зачислено 85 000 ₽. Доступно к использованию.', 'income'),
(1, 'Новое предложение', 'Специально для вас: кредитная карта с лимитом до 500 000 ₽ под 9.9% годовых', 'offer'),
(2, 'Оплата услуг', 'Списано 3 500 ₽ за коммунальные услуги. Спасибо за использование ВТБ!', 'payment'),
(2, 'Безопасность', 'Вход в приложение выполнен с нового устройства. Если это были не вы, свяжитесь с поддержкой.', 'security');