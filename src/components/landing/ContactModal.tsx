import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContactFormSchema, type ContactForm } from '@/api/types';
import { api } from '@/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactForm>({
    resolver: zodResolver(ContactFormSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    setLoading(true);
    try {
      await api.submitContact(data);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        reset();
        onClose();
      }, 2000);
    } catch {
      // toast error would go here
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSubmitted(false);
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{submitted ? 'Message Sent!' : 'Get in Touch'}</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 rounded-full bg-status-completed/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-status-completed" />
            </div>
            <p className="text-muted-foreground text-center">We'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Your name *</Label>
              <Input id="contact-name" {...register('name')} placeholder="Jane Doe" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Work email *</Label>
              <Input id="contact-email" type="email" {...register('email')} placeholder="jane@company.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-company">Company name</Label>
              <Input id="contact-company" {...register('company')} placeholder="Acme Inc." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">What are you looking for?</Label>
              <Textarea id="contact-message" {...register('message')} placeholder="Tell us about your needs..." className="min-h-[80px] resize-none" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send Message
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
