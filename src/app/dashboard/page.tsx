'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Message } from '@/Model/User.model';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { Loader2, RefreshCcw, Copy } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { acceptMessageSchema } from '@/Schema/acceptmessageSchema';
import { toast } from 'sonner';

type AcceptMessageForm = {
  acceptMessages: boolean;
};

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { data: session } = useSession();

  const form = useForm<AcceptMessageForm>({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: { acceptMessages: false },
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((message) => message._id !== messageId));
  };

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', !!response.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? 'Failed to fetch message settings'
      );
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(
    async (refresh = false) => {
      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse>('/api/get-messages');
        setMessages(response.data.messages || []);
        if (refresh) toast.success('Showing latest messages');
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(
          axiosError.response?.data.message ?? 'Failed to fetch messages'
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!session?.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
      toast.success(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? 'Failed to update message settings'
      );
    }
  };

  if (!session?.user) return null;

  const { username } = session.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile URL copied to clipboard');
  };

  return (
    <div className="my-10 mx-auto max-w-6xl p-8 rounded-3xl bg-white/60 backdrop-blur-md shadow-xl border border-gray-200">
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
        User Dashboard
      </h1>

      {/* Profile URL */}
      <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">
          Copy Your Unique Link
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-700 focus:outline-none"
          />
          <Button
            onClick={copyToClipboard}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </div>
      </div>

      {/* Switch */}
      <div className="flex items-center mb-6 gap-3">
        <Switch
          {...register('acceptMessages')}
          checked={!!acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="text-gray-800 font-medium">
          Accept Messages:{" "}
          <span
            className={
              acceptMessages ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'
            }
          >
            {acceptMessages ? 'On' : 'Off'}
          </span>
        </span>
      </div>

      <Separator />

      {/* Refresh Button */}
      <div className="mt-6">
        <Button
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
          className="flex items-center gap-2 border-gray-300 hover:border-indigo-400"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Messages */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={String(message._id)}
              className="transform transition hover:scale-[1.02] hover:shadow-lg"
            >
              <MessageCard
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
