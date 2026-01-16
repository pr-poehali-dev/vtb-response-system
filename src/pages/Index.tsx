import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  const balance = '1 234 567.89';
  const cardNumber = '•••• 4892';

  const transactions = [
    { id: 1, name: 'Пятёрочка', amount: -856.50, date: '16 янв', category: 'Продукты', icon: 'ShoppingCart' },
    { id: 2, name: 'Зарплата', amount: +85000, date: '15 янв', category: 'Доход', icon: 'TrendingUp' },
    { id: 3, name: 'Оплата ЖКХ', amount: -3500, date: '14 янв', category: 'Коммунальные', icon: 'Home' },
    { id: 4, name: 'АЗС Газпромнефть', amount: -2100, date: '13 янв', category: 'Транспорт', icon: 'Fuel' },
  ];

  const quickActions = [
    { label: 'Перевод', icon: 'Send', color: 'bg-primary' },
    { label: 'Платёж', icon: 'CreditCard', color: 'bg-secondary' },
    { label: 'Пополнить', icon: 'Wallet', color: 'bg-primary' },
    { label: 'История', icon: 'Clock', color: 'bg-secondary' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground px-6 pt-8 pb-32 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">ВТБ</h1>
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground hover:bg-white/20 relative"
              onClick={() => navigate('/notifications')}
            >
              <Icon name="Bell" size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground hover:bg-white/20"
              onClick={() => navigate('/admin')}
            >
              <Icon name="Settings" size={22} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-primary-foreground/80 text-sm">Общий баланс</p>
          <p className="text-4xl font-bold tracking-tight">{balance} ₽</p>
          <p className="text-primary-foreground/70 text-sm">Карта {cardNumber}</p>
        </div>
      </div>

      <div className="px-6 -mt-24">
        <div className="grid grid-cols-4 gap-3 mb-6">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`${action.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-active:scale-95`}>
                <Icon name={action.icon} size={24} />
              </div>
              <span className="text-xs text-foreground/80 font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        <Card className="p-5 mb-6 shadow-sm border-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Мои счета</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              Все <Icon name="ChevronRight" size={16} />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-4 text-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-sm opacity-90">Дебетовая карта</p>
                  <p className="text-lg font-semibold mt-1">1 234 567.89 ₽</p>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  Основная
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm font-mono tracking-wider">•••• •••• •••• 4892</p>
                <Icon name="CreditCard" size={28} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-secondary to-secondary/90 rounded-xl p-4 text-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-sm opacity-90">Накопительный счёт</p>
                  <p className="text-lg font-semibold mt-1">456 789.00 ₽</p>
                </div>
                <p className="text-sm bg-white/20 px-2 py-1 rounded">7.5% годовых</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm">До 31 марта 2026</p>
                <Icon name="PiggyBank" size={28} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-sm border-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Последние операции</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              Все <Icon name="ChevronRight" size={16} />
            </Button>
          </div>

          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id}>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      transaction.amount > 0 ? 'bg-green-100' : 'bg-muted'
                    }`}>
                      <Icon 
                        name={transaction.icon} 
                        size={20} 
                        className={transaction.amount > 0 ? 'text-green-600' : 'text-foreground/60'}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.name}</p>
                      <p className="text-xs text-muted-foreground">{transaction.category} • {transaction.date}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-foreground'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
                {transaction.id !== transactions[transactions.length - 1].id && <Separator />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around px-6 py-3">
          {[
            { id: 'home', icon: 'Home', label: 'Главная' },
            { id: 'products', icon: 'LayoutGrid', label: 'Продукты' },
            { id: 'services', icon: 'Briefcase', label: 'Услуги' },
            { id: 'profile', icon: 'User', label: 'Профиль' },
            { id: 'support', icon: 'Headphones', label: 'Поддержка' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-1 min-w-[60px] group"
            >
              <Icon
                name={item.icon}
                size={24}
                className={`transition-colors ${
                  activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;