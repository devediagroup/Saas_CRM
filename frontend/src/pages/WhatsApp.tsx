import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle,
  Send,
  Search,
  Filter,
  Clock,
  Check,
  CheckCheck,
  Phone,
  MoreVertical,
  Paperclip,
  Smile,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

interface WhatsAppChat {
  id: number;
  attributes: {
    contact_name: string;
    contact_phone: string;
    last_message: string;
    last_message_time: string;
    status: 'new' | 'replied' | 'closed';
    priority: 'low' | 'medium' | 'high';
    unread_count: number;
    lead?: {
      data?: {
        id: number;
        attributes: {
          name: string;
        };
      };
    };
    createdAt: string;
    updatedAt: string;
  };
}

interface WhatsAppMessage {
  id: number;
  attributes: {
    content: string;
    message_type: 'text' | 'image' | 'document' | 'audio';
    direction: 'inbound' | 'outbound';
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
    chat: {
      data: {
        id: number;
      };
    };
  };
}

const WhatsApp = () => {
  const { t } = useTranslation();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  // Fetch chats
  const { data: chatsData, isLoading: chatsLoading } = useQuery({
    queryKey: ['whatsappChats', searchTerm, statusFilter, priorityFilter],
    queryFn: () => api.getWhatsAppChats({
      'filters[contact_name][$containsi]': searchTerm,
      ...(statusFilter !== 'all' && { 'filters[status][$eq]': statusFilter }),
      ...(priorityFilter !== 'all' && { 'filters[priority][$eq]': priorityFilter }),
      'sort[0]': 'last_message_time:desc',
      'populate': 'lead'
    })
  });

  // Fetch messages for selected chat
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['whatsappMessages', selectedChatId],
    queryFn: async () => {
      if (!selectedChatId) {
        return { data: { data: [] } };
      }
      return await api.getWhatsAppMessages({
        'filters[chat][id][$eq]': selectedChatId,
        'sort[0]': 'timestamp:asc'
      });
    },
    enabled: !!selectedChatId
  });

  const chats = chatsData?.data?.data || [];
  const messages = messagesData?.data?.data || [];
  const selectedChat = chats.find((chat: WhatsAppChat) => chat.id === selectedChatId);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createWhatsAppMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsappMessages', selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ['whatsappChats'] });
      setNewMessage("");
      toast.success(t('whatsapp.messages.messageSent'));
    },
    onError: () => {
      toast.error(t('whatsapp.messages.sendError'));
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatId) return;

    sendMessageMutation.mutate({
      content: newMessage.trim(),
      message_type: 'text',
      direction: 'outbound',
      status: 'sent',
      timestamp: new Date().toISOString(),
      chat: selectedChatId
    });
  };

  const handleFileAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChatId) return;

    // For now, just show a toast. In a real implementation, you'd upload the file
    toast.info(t('whatsapp.messages.fileAttachment') || `Selected file: ${file.name}`);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const insertEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: "default",
      replied: "secondary",
      closed: "outline"
    };
    const labels = {
      new: t('whatsapp.status.new'),
      replied: t('whatsapp.status.replied'),
      closed: t('whatsapp.status.closed')
    };
    return <Badge variant={variants[status as keyof typeof variants] as any} className="text-xs">
      {labels[status as keyof typeof labels]}
    </Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-green-600",
      medium: "text-yellow-600",
      high: "text-red-600"
    };
    return colors[priority as keyof typeof colors] || "text-gray-600";
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <Clock className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('ar-SA', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex">
        {/* Chats Sidebar */}
        <div className="w-1/3 border-l border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold arabic-text">{t('whatsapp.title')}</h2>
              <Badge variant="secondary" className="arabic-text">
                {chats.length} {t('whatsapp.conversation')}
              </Badge>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('whatsapp.searchInConversations')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                dir="rtl"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('whatsapp.allStatuses')}</SelectItem>
                  <SelectItem value="new">{t('whatsapp.status.new')}</SelectItem>
                  <SelectItem value="replied">{t('whatsapp.status.replied')}</SelectItem>
                  <SelectItem value="closed">{t('whatsapp.status.closed')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="flex-1" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('whatsapp.allPriorities')}</SelectItem>
                  <SelectItem value="high">{t('whatsapp.priority.high')}</SelectItem>
                  <SelectItem value="medium">{t('whatsapp.priority.medium')}</SelectItem>
                  <SelectItem value="low">{t('whatsapp.priority.low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chats List */}
          <ScrollArea className="flex-1">
            {chatsLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : chats.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2 arabic-text">{t('whatsapp.noConversations')}</h3>
                <p className="text-muted-foreground text-sm arabic-text">
                  {t('whatsapp.noConversationsFound')}
                </p>
              </div>
            ) : (
              <div className="p-2">
                {chats.map((chat: WhatsAppChat) => (
                  <div
                    key={chat.id}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${selectedChatId === chat.id ? 'bg-muted' : ''
                      }`}
                    onClick={() => setSelectedChatId(chat.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        {chat.attributes.unread_count > 0 && (
                          <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
                            {chat.attributes.unread_count}
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium truncate arabic-text">
                            {chat.attributes.contact_name}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(chat.attributes.last_message_time)}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground truncate arabic-text mb-2">
                          {chat.attributes.last_message}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {getStatusBadge(chat.attributes.status)}
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(chat.attributes.priority)}`} />
                          </div>
                          <span className="text-xs text-muted-foreground" dir="ltr">
                            {chat.attributes.contact_phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold arabic-text">{selectedChat.attributes.contact_name}</h3>
                      <p className="text-sm text-muted-foreground" dir="ltr">
                        {selectedChat.attributes.contact_phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedChat.attributes.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Phone className="h-4 w-4 ml-2" />
                          {t('whatsapp.call')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="h-4 w-4 ml-2" />
                          {t('whatsapp.viewProfile')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                          <div className="max-w-xs">
                            <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message: WhatsAppMessage) => (
                      <div
                        key={message.id}
                        className={`flex ${message.attributes.direction === 'outbound' ? 'justify-end' : 'justify-start'
                          }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.attributes.direction === 'outbound'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                            }`}
                        >
                          <p className="arabic-text">{message.attributes.content}</p>
                          <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                            <span>{formatTime(message.attributes.timestamp)}</span>
                            {message.attributes.direction === 'outbound' && (
                              <div className="ml-2">
                                {getMessageStatusIcon(message.attributes.status)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileSelect}
                />
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleFileAttachment}
                    title={t('whatsapp.attachFile') || 'Attach file'}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleEmojiClick}
                      title={t('whatsapp.addEmoji') || 'Add emoji'}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-full right-0 mb-2 p-2 bg-white border rounded-lg shadow-lg z-10">
                        <div className="grid grid-cols-6 gap-1">
                          {['😀', '😂', '😍', '👍', '👎', '❤️', '😊', '😢', '😡', '🤔', '👏', '🔥'].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className="p-1 hover:bg-gray-100 rounded text-lg"
                              onClick={() => insertEmoji(emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t('whatsapp.typeMessage')}
                      dir="rtl"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 arabic-text">{t('whatsapp.selectConversation')}</h3>
                <p className="text-muted-foreground arabic-text">
                  {t('whatsapp.selectConversationDesc')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WhatsApp; 