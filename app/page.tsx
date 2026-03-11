import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Users, Settings } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Landing Conveyor
        </h1>

        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Платформа для створення та управління конвейєром лендингів з інтеграцією CS-Cart
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Лендинги</h3>
            <p className="text-sm text-gray-600">
              Створюйте багатоваріантні лендинги з повним контролем
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Users className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold mb-2">Заявки</h3>
            <p className="text-sm text-gray-600">
              Збирайте та обробляйте заявки з аналітикою UTM
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Settings className="w-12 h-12 mx-auto mb-4 text-purple-600" />
            <h3 className="text-lg font-semibold mb-2">Інтеграція</h3>
            <p className="text-sm text-gray-600">
              Автоматична відправка в CS-Cart через webhook
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/admin/login">
              Адмін панель
            </Link>
          </Button>

          <Button size="lg" variant="outline" asChild>
            <Link href="/l/demo-winter-suit">
              Демо лендинг
            </Link>
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-12">
          Переглянути документацію в файлі README.md
        </p>
      </div>
    </div>
  );
}
