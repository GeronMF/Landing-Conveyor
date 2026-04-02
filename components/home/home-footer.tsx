import Link from 'next/link';

export function HomeFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 md:flex-row md:items-start">
        <div className="text-center md:text-left">
          <p className="text-sm font-medium text-slate-900">Контакти</p>
          <p className="mt-2 text-sm text-slate-600">
            Питання щодо оформлення — через{' '}
            <a href="#contact" className="text-blue-600 underline-offset-4 hover:underline">
              форму вище
            </a>
            .
          </p>
        </div>
        <div className="flex flex-col gap-2 text-center text-sm md:text-right">
          <Link
            href="#legal"
            className="text-slate-600 transition hover:text-slate-900"
          >
            Умови та інформація
          </Link>
          <span className="text-slate-500">
            Політика конфіденційності та користувацька угода уточнюються в оператора сервісу.
          </span>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-5xl text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Офіційна сторінка оформлення замовлень
      </p>
    </footer>
  );
}
