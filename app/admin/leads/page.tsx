'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<any>({ page: 1, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, pagination.page]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', pagination.page.toString());

      const response = await fetch(`/api/admin/leads?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
        setPagination(data.pagination);
      }
    } catch {
      toast.error('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (leadId: string) => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}/retry`, { method: 'POST' });

      if (response.ok) {
        toast.success('Заявка відправлена повторно');
        fetchLeads();
      } else {
        const data = await response.json().catch(() => null);
        toast.error(`Помилка: ${data?.error || 'Невідома помилка'}`);
      }
    } catch {
      toast.error('Помилка повторної відправки');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Заявки</h1>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Всі статуси" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchLeads}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Завантаження...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Заявок не знайдено</div>
      ) : (
        <>
          <div className="border rounded-lg mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ім'я</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Лендинг</TableHead>
                  <TableHead>Варіант</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Дії</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {lead.landing?.slug || '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {lead.variant?.title || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          lead.status === 'sent'
                            ? 'default'
                            : lead.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(lead.createdAt), 'dd.MM.yyyy HH:mm')}</TableCell>
                    <TableCell>
                      {lead.status === 'failed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRetry(lead.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
              >
                Попередня
              </Button>
              <span className="py-2 px-4">
                Сторінка {pagination.page} з {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
              >
                Наступна
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
