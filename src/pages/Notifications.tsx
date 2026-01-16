import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  sentAt: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/57744f30-1ea8-4cbd-b52a-66c701f373a5?user_id=1');
      const data = await response.json();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch('https://functions.poehali.dev/57744f30-1ea8-4cbd-b52a-66c701f373a5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', notificationId: id }),
      });
      
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income': return 'TrendingUp';
      case 'payment': return 'CreditCard';
      case 'offer': return 'Gift';
      case 'security': return 'Shield';
      default: return 'Bell';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'bg-green-100 text-green-700';
      case 'payment': return 'bg-blue-100 text-blue-700';
      case 'offer': return 'bg-purple-100 text-purple-700';
      case 'security': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ч назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader" size={40} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка уведомлений...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="bg-primary text-primary-foreground px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-white/20"
            onClick={() => window.history.back()}
          >
            <Icon name="ArrowLeft" size={24} />
          </Button>
          <h1 className="text-2xl font-semibold">Уведомления</h1>
        </div>
        {notifications.filter(n => !n.isRead).length > 0 && (
          <p className="text-primary-foreground/80 text-sm">
            {notifications.filter(n => !n.isRead).length} непрочитанных
          </p>
        )}
      </div>

      <div className="px-6 mt-6 space-y-3">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Нет уведомлений</p>
            <p className="text-muted-foreground text-sm">
              Здесь будут отображаться важные сообщения от банка
            </p>
          </Card>
        ) : (
          notifications.map((notification, index) => (
            <Card 
              key={notification.id} 
              className={`p-4 ${!notification.isRead ? 'border-primary/50 bg-primary/5' : ''}`}
            >
              <div className="flex gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                  <Icon name={getTypeIcon(notification.type)} size={24} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{notification.title}</h3>
                    {!notification.isRead && (
                      <Badge variant="default" className="bg-primary text-xs">Новое</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(notification.sentAt)}
                    </p>
                    
                    {!notification.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary h-7"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Прочитано
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
