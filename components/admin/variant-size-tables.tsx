'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { BilingualField } from './bilingual-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VariantSizeTablesProps {
  sizeTables: Array<{
    id: string;
    title: string;
    titleRu?: string;
    columns?: any;
    rows: Array<{
      id: string;
      sizeLabel: string;
      columns: any;
      order: number;
    }>;
    order: number;
  }>;
  variantId: string;
  onUpdate: (tables: any[]) => void;
}

export function VariantSizeTables({ sizeTables, variantId, onUpdate }: VariantSizeTablesProps) {
  const [localTables, setLocalTables] = useState(
    (sizeTables || []).sort((a, b) => (a.order || 0) - (b.order || 0))
  );

  useEffect(() => {
    const sorted = (sizeTables || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    setLocalTables(sorted);
  }, [sizeTables]);

  const handleAddTable = async () => {
    try {
      const response = await fetch(`/api/admin/variants/${variantId}/size-tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Таблиця розмірів',
          columns: {},
          order: localTables.length,
        }),
      });
      if (response.ok) {
        const newTable = await response.json();
        const updated = [...localTables, { ...newTable, rows: [] }];
        setLocalTables(updated);
        onUpdate(updated);
      }
    } catch (error: any) {
      console.error('Error adding size table:', error);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      const response = await fetch(`/api/admin/size-tables/${tableId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updated = localTables.filter((t) => t.id !== tableId);
        setLocalTables(updated);
        onUpdate(updated);
      }
    } catch (error: any) {
      console.error('Error deleting size table:', error);
    }
  };

  const handleUpdateTable = async (tableId: string, data: any) => {
    try {
      const response = await fetch(`/api/admin/size-tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updated = localTables.map((t) => (t.id === tableId ? { ...t, ...data } : t));
        setLocalTables(updated);
        onUpdate(updated);
      }
    } catch (error: any) {
      console.error('Error updating size table:', error);
    }
  };

  const handleAddColumn = (tableId: string, columnKey: string, ukLabel: string, ruLabel: string) => {
    const table = localTables.find((t) => t.id === tableId);
    if (!table) return;

    const columns = table.columns || {};
    columns[columnKey] = { uk: ukLabel, ru: ruLabel };

    handleUpdateTable(tableId, { columns });
  };

  const handleAddRow = async (tableId: string) => {
    const table = localTables.find((t) => t.id === tableId);
    if (!table) return;

    try {
      const response = await fetch(`/api/admin/size-tables/${tableId}/rows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sizeLabel: 'S',
          columns: {},
          order: (table.rows || []).length,
        }),
      });
      if (response.ok) {
        const newRow = await response.json();
        const updated = localTables.map((t) =>
          t.id === tableId ? { ...t, rows: [...(t.rows || []), newRow] } : t
        );
        setLocalTables(updated);
        onUpdate(updated);
      }
    } catch (error: any) {
      console.error('Error adding row:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleAddTable}>
        <Plus className="w-4 h-4 mr-2" />
        Додати таблицю
      </Button>

      <div className="space-y-6">
        {localTables.map((table) => (
          <Card key={table.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Таблиця</CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteTable(table.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <BilingualField
                label="Назва таблиці"
                ukValue={table.title || ''}
                ruValue={table.titleRu || ''}
                onUkChange={(value) => handleUpdateTable(table.id, { title: value })}
                onRuChange={(value) => handleUpdateTable(table.id, { titleRu: value })}
              />

              <div>
                <Label>Колонки</Label>
                <div className="mt-2 space-y-2">
                  {Object.entries(table.columns || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex gap-2">
                      <Input
                        value={value?.uk || ''}
                        placeholder="UK"
                        onChange={(e) => {
                          const columns = { ...(table.columns || {}) };
                          columns[key] = { ...columns[key], uk: e.target.value };
                          handleUpdateTable(table.id, { columns });
                        }}
                      />
                      <Input
                        value={value?.ru || ''}
                        placeholder="RU"
                        onChange={(e) => {
                          const columns = { ...(table.columns || {}) };
                          columns[key] = { ...columns[key], ru: e.target.value };
                          handleUpdateTable(table.id, { columns });
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newKey = `col_${Date.now()}`;
                      handleAddColumn(table.id, newKey, 'Нова колонка', 'Новая колонка');
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Додати колонку
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Рядки</Label>
                  <Button size="sm" onClick={() => handleAddRow(table.id)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Додати рядок
                  </Button>
                </div>
                <div className="space-y-2">
                  {(table.rows || []).map((row) => (
                    <div key={row.id} className="flex gap-2 items-center">
                      <Input
                        value={row.sizeLabel || ''}
                        placeholder="Розмір"
                        className="w-20"
                        onChange={async (e) => {
                          try {
                            const response = await fetch(`/api/admin/size-table-rows/${row.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ sizeLabel: e.target.value }),
                            });
                            if (response.ok) {
                              const updated = localTables.map((t) =>
                                t.id === table.id
                                  ? {
                                      ...t,
                                      rows: t.rows.map((r) =>
                                        r.id === row.id ? { ...r, sizeLabel: e.target.value } : r
                                      ),
                                    }
                                  : t
                              );
                              setLocalTables(updated);
                              onUpdate(updated);
                            }
                          } catch (error: any) {
                            console.error('Error updating row:', error);
                          }
                        }}
                      />
                      {Object.keys(table.columns || {}).map((colKey) => (
                        <Input
                          key={colKey}
                          value={row.columns?.[colKey] || ''}
                          placeholder={table.columns?.[colKey]?.uk || colKey}
                          onChange={async (e) => {
                            try {
                              const columns = { ...(row.columns || {}), [colKey]: e.target.value };
                              const response = await fetch(`/api/admin/size-table-rows/${row.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ columns }),
                              });
                              if (response.ok) {
                                const updated = localTables.map((t) =>
                                  t.id === table.id
                                    ? {
                                        ...t,
                                        rows: t.rows.map((r) =>
                                          r.id === row.id ? { ...r, columns } : r
                                        ),
                                      }
                                    : t
                                );
                                setLocalTables(updated);
                                onUpdate(updated);
                              }
                            } catch (error: any) {
                              console.error('Error updating row:', error);
                            }
                          }}
                        />
                      ))}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/admin/size-table-rows/${row.id}`, {
                              method: 'DELETE',
                            });
                            if (response.ok) {
                              const updated = localTables.map((t) =>
                                t.id === table.id
                                  ? { ...t, rows: t.rows.filter((r) => r.id !== row.id) }
                                  : t
                              );
                              setLocalTables(updated);
                              onUpdate(updated);
                            }
                          } catch (error: any) {
                            console.error('Error deleting row:', error);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
