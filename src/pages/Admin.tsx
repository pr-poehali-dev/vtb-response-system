import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface User {
  id: number;
  phone: string;
  fullName: string;
  notificationCount: number;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPhone, setSelectedPhone] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/39eb789c-2681-4296-acf4-bc21e2f4a228');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Ошибка загрузки пользователей');
    }
  };

  const sendNotification = async () => {
    if (!selectedPhone || !title || !message) {
      toast.error('Заполните все поля');
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/57744f30-1ea8-4cbd-b52a-66c701f373a5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          phone: selectedPhone,
          title,
          message,
          type,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Уведомление отправлено!');
        setTitle('');
        setMessage('');
        setSelectedPhone('');
        fetchUsers();
      } else {
        toast.error('Ошибка отправки');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Ошибка отправки уведомления');
    } finally {
      setSending(false);
    }
  };

  const quickTemplates = [
    {
      title: 'Зачисление средств',
      message: 'На ваш счёт зачислено {amount} ₽. Доступно к использованию.',
      type: 'income',
    },
    {
      title: 'Новое предложение',
      message: 'Специально для вас: кредитная карта с выгодными условиями.',
      type: 'offer',
    },
    {
      title: 'Подтверждение операции',
      message: 'Операция на сумму {amount} ₽ успешно выполнена.',
      type: 'payment',
    },
    {
      title: 'Предупреждение безопасности',
      message: 'Обнаружена попытка входа с нового устройства. Если это были не вы, свяжитесь с поддержкой.',
      type: 'security',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-white/20"
            onClick={() => window.history.back()}
          >
            <Icon name="ArrowLeft" size={24} />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Админ-панель ВТБ</h1>
            <p className="text-primary-foreground/80 text-sm">Отправка уведомлений клиентам</p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        <Card className="p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="Users" size={20} />
            Клиенты банка
          </h2>
          
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedPhone(user.phone)}
                className={`w-full p-3 rounded-lg border transition-colors text-left ${
                  selectedPhone === user.phone
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {user.notificationCount} уведомлений
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="Send" size={20} />
            Отправить уведомление
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Получатель</Label>
              <Input
                id="phone"
                value={selectedPhone}
                onChange={(e) => setSelectedPhone(e.target.value)}
                placeholder="+7 999 123-45-67"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="type">Тип уведомления</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Информация</SelectItem>
                  <SelectItem value="income">Зачисление</SelectItem>
                  <SelectItem value="payment">Оплата</SelectItem>
                  <SelectItem value="offer">Предложение</SelectItem>
                  <SelectItem value="security">Безопасность</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Заголовок</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Зачисление средств"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="message">Сообщение</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Текст уведомления для клиента..."
                rows={4}
                className="mt-1.5"
              />
            </div>

            <Button
              onClick={sendNotification}
              disabled={sending || !selectedPhone || !title || !message}
              className="w-full"
              size="lg"
            >
              {sending ? (
                <>
                  <Icon name="Loader" size={20} className="animate-spin mr-2" />
                  Отправка...
                </>
              ) : (
                <>
                  <Icon name="Send" size={20} className="mr-2" />
                  Отправить уведомление
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="Sparkles" size={20} />
            Быстрые шаблоны
          </h2>

          <div className="grid gap-2">
            {quickTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => {
                  setTitle(template.title);
                  setMessage(template.message);
                  setType(template.type);
                }}
                className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors text-left"
              >
                <p className="font-medium text-sm mb-1">{template.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.message}
                </p>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
