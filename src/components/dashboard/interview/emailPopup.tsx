import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Modal from "@/components/dashboard/Modal";
import { Check, Mail } from "lucide-react";
import emailjs from '@emailjs/browser';

interface EmailPopupProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
}

// Dummy email data
const dummyEmails = [
  { id: 1, email: "7990satyam200@gmail.com" },
  { id: 2, email: "shailendramalviya159@gmail.com" },
  { id: 3, email: "alex.jackson@gmail.com" },
  { id: 4, email: "sarah.miller@gmail.com" },
  { id: 5, email: "michael.brown@gmail.com" },
  { id: 6, email: "emma.wilson@gmail.com" },
  { id: 7, email: "david.taylor@gmail.com" },
  { id: 8, email: "olivia.johnson@gmail.com" },
  { id: 9, email: "james.anderson@gmail.com" },
  { id: 10, email: "sophia.martin@gmail.com" },
];

function EmailPopup({ open, onClose, shareUrl }: EmailPopupProps) {
  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
  const [message, setMessage] = useState<string>(`Check out this interview: ${shareUrl}`);
  const [sending, setSending] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);

  // Initialize EmailJS when component mounts
  useEffect(() => {
    // Initialize with your public key
    emailjs.init('hvnzhY9reCDP7ATuf');
  }, []);

  const handleSelectAll = () => {
    if (selectedEmails.length === dummyEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(dummyEmails.map(email => email.id));
    }
  };

  const handleSelectEmail = (id: number) => {
    if (selectedEmails.includes(id)) {
      setSelectedEmails(selectedEmails.filter(emailId => emailId !== id));
    } else {
      setSelectedEmails([...selectedEmails, id]);
    }
  };

  const handleSendEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEmails.length === 0) {
      toast.error("Please select at least one email to send to.", {
        position: "bottom-right",
        duration: 3000,
      });
      return;
    }

    setSending(true);
    setSent(false); // Reset sent state before sending

    const emailPromises = selectedEmails.map(id => {
      const recipient = dummyEmails.find(email => email.id === id);
      if (!recipient) return Promise.reject(new Error(`Email ID ${id} not found`));

      const templateParams = {
        email: recipient.email,
        message: message,
        interview_link: shareUrl,
      };

      return emailjs.send(
        'service_wxu72kj',
        'template_nn9caov',
        templateParams,
        'hvnzhY9reCDP7ATuf'
      );
    });

    try {
      const results = await Promise.allSettled(emailPromises);
      
      const successfulSends = results.filter(result => result.status === 'fulfilled').length;
      const failedSends = results.filter(result => result.status === 'rejected').length;

      setSending(false);

      if (successfulSends > 0) {
        setSent(true);
        toast.success(`Sent ${successfulSends} out of ${selectedEmails.length} emails successfully.`, {
          position: "bottom-right",
          duration: 3000,
        });
      }

      if (failedSends > 0) {
        toast.error(`Failed to send ${failedSends} emails. Check console for details.`, {
          position: "bottom-right",
          duration: 5000,
        });
        // Log detailed errors for debugging
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const recipient = dummyEmails.find(e => e.id === selectedEmails[index]); // Find recipient again
            const failedEmail = recipient?.email || `ID ${selectedEmails[index]}`;
            // Reconstruct params for logging clarity, using 'email' and 'interview_link' keys
            const paramsSent = { 
               email: recipient?.email, 
               message: message, 
               interview_link: shareUrl, // Use 'interview_link' key here too
            };
            console.error(`Email send failed for ${failedEmail}:`, result.reason, 'Params sent:', paramsSent);
          }
        });
      }

      if (successfulSends > 0) {
         setTimeout(() => {
           onClose();
           setSent(false);
           setSelectedEmails([]);
         }, 1500);
      }
      
    } catch (error) {
      console.error('Unexpected error during bulk email sending:', error);
      setSending(false);
      toast.error(`An unexpected error occurred while sending emails.`, {
        position: "bottom-right",
        duration: 3000,
      });
    }
  };

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} closeOnOutsideClick={false} onClose={onClose}>
      <div className="w-[32rem] flex flex-col">
        <p className="text-lg font-semibold mb-4">Send Interview Link via Email</p>
        
        <form onSubmit={handleSendEmails}>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Recipients</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                type="button"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selectedEmails.length === dummyEmails.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
              {dummyEmails.map(email => (
                <div key={email.id} className="flex items-center mb-2 last:mb-0">
                  <input
                    type="checkbox"
                    id={`email-${email.id}`}
                    checked={selectedEmails.includes(email.id)}
                    onChange={() => handleSelectEmail(email.id)}
                    className="mr-3 h-4 w-4"
                  />
                  <label htmlFor={`email-${email.id}`} className="flex-1 cursor-pointer">
                    {email.email}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block font-medium mb-2">Message</label>
            <textarea
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded min-h-[100px]"
              placeholder="Enter your message here..."
            />
            <input type="hidden" name="interview_url" value={shareUrl} />
          </div>
          
          <Button
            type="submit"
            className="flex items-center bg-indigo-600"
            disabled={sending || sent}
          >
            {sending ? (
              <>
                <span className="mr-2">Sending...</span>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </>
            ) : sent ? (
              <>
                <Check size={16} className="mr-2" />
                Sent
              </>
            ) : (
              <>
                <Mail size={16} className="mr-2" />
                Send Email{selectedEmails.length > 0 ? ` (${selectedEmails.length})` : ''}
              </>
            )}
          </Button>
        </form>
      </div>
    </Modal>
  );
}

export default EmailPopup; 
