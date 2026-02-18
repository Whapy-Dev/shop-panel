import { useState } from 'react';
import { MessageSquare, Plus, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMyTickets, useCreateTicket, useReplyTicket } from '@/hooks/useTickets';
import { toast } from 'sonner';

type TicketCategory = 'general' | 'billing' | 'technical' | 'feature_request';
type TicketPriority = 'low' | 'medium' | 'high';

export default function SupportPage() {
  const { data: tickets, isLoading } = useMyTickets();
  const createTicket = useCreateTicket();
  const replyTicket = useReplyTicket();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // Create ticket form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('general');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [message, setMessage] = useState('');

  // Reply form
  const [replyMessage, setReplyMessage] = useState('');

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createTicket.mutateAsync({
        subject,
        category,
        priority,
        message,
      });

      toast.success('Ticket creado exitosamente');
      setCreateDialogOpen(false);
      setSubject('');
      setCategory('general');
      setPriority('medium');
      setMessage('');
    } catch (error) {
      toast.error('Error al crear el ticket');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      await replyTicket.mutateAsync({
        id: selectedTicket.id,
        message: replyMessage,
      });

      toast.success('Respuesta enviada');
      setReplyMessage('');
    } catch (error) {
      toast.error('Error al enviar la respuesta');
    }
  };

  const getCategoryBadge = (cat: string) => {
    const labels: Record<string, string> = {
      general: 'General',
      billing: 'Facturación',
      technical: 'Técnico',
      feature_request: 'Sugerencia',
    };
    return <Badge variant="outline">{labels[cat] || cat}</Badge>;
  };

  const getPriorityBadge = (pri: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      low: { variant: 'secondary', label: 'Baja' },
      medium: { variant: 'default', label: 'Media' },
      high: { variant: 'destructive', label: 'Alta' },
    };
    const { variant, label } = config[pri] || { variant: 'secondary', label: pri };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      open: { variant: 'default', label: 'Abierto' },
      in_progress: { variant: 'default', label: 'En Progreso' },
      resolved: { variant: 'secondary', label: 'Resuelto' },
      closed: { variant: 'secondary', label: 'Cerrado' },
    };
    const { variant, label } = config[status] || { variant: 'secondary', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Soporte</h1>
          <p className="text-muted-foreground">
            Gestiona tus tickets de soporte
          </p>
        </div>

        {/* Create Ticket Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Ticket de Soporte</DialogTitle>
              <DialogDescription>
                Describe tu problema o sugerencia y nuestro equipo te ayudará
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Describe brevemente el problema"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={category} onValueChange={(v: TicketCategory) => setCategory(v)}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="billing">Facturación</SelectItem>
                      <SelectItem value="technical">Técnico</SelectItem>
                      <SelectItem value="feature_request">Sugerencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select value={priority} onValueChange={(v: TicketPriority) => setPriority(v)}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe tu problema en detalle"
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Crear Ticket
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tickets List */}
      {!tickets?.data || tickets.data.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No tienes tickets de soporte. Crea uno si necesitas ayuda.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.data.map((ticket) => (
            <Card
              key={ticket.id}
              className="p-6 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => {
                setSelectedTicket(ticket);
                setDetailDialogOpen(true);
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{ticket.subject}</h3>
                  <div className="flex flex-wrap gap-2">
                    {getCategoryBadge(ticket.category)}
                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTicket && getCategoryBadge(selectedTicket.category)}
                {selectedTicket && getPriorityBadge(selectedTicket.priority)}
                {selectedTicket && getStatusBadge(selectedTicket.status)}
              </div>
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <>
              {/* Messages */}
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {selectedTicket.messages?.map((msg: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        msg.senderRole === 'admin'
                          ? 'bg-primary/10 ml-8'
                          : 'bg-accent mr-8'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-sm">
                          {msg.senderRole === 'admin' ? 'Soporte' : 'Tú'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleString('es-ES')}
                        </p>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Reply Form */}
              {selectedTicket.status !== 'closed' && (
                <form onSubmit={handleReply} className="flex gap-2">
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
