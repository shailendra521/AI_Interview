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
  { id: 2, email: "jane.smith@example.com" },
  { id: 3, email: "alex.jackson@example.com" },
  { id: 4, email: "sarah.miller@example.com" },
  { id: 5, email: "michael.brown@example.com" },
  { id: 6, email: "emma.wilson@example.com" },
  { id: 7, email: "david.taylor@example.com" },
  { id: 8, email: "olivia.johnson@example.com" },
  { id: 9, email: "james.anderson@example.com" },
  { id: 10, email: "sophia.martin@example.com" },
];

function EmailPopup({ open, onClose, shareUrl }: EmailPopupProps) {
  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
  const [message, setMessage] = useState<string>(`Check out this interview: ${shareUrl}`);
  const [sending, setSending] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

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

  const handleSendEmails = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEmails.length === 0) {
      toast.error("Please select at least one email to send to.", {
        position: "bottom-right",
        duration: 3000,
      });
      return;
    }

    setSending(true);
    
    // Get selected email addresses as string
    const selectedEmailAddresses = dummyEmails
      .filter(email => selectedEmails.includes(email.id))
      .map(email => email.email)
      .join(", ");
    
    if (formRef.current) {
      // Use EmailJS sendForm with the form reference
      emailjs
        .sendForm(
          'service_wxu72kj',            // Your EmailJS service ID
          'template_b6bxc2a',           // Your EmailJS template ID
          formRef.current,              // Form reference
          'hvnzhY9reCDP7ATuf'           // Your EmailJS public key
        )
        .then(
          (result) => {
            console.log('SUCCESS!', result.text);
            setSending(false);
            setSent(true);
            
            toast.success(`Email sent to ${selectedEmails.length} recipients!`, {
              position: "bottom-right",
              duration: 3000,
            });
            
            setTimeout(() => {
              onClose();
              setSent(false);
              setSelectedEmails([]);
            }, 1500);
          },
          (error) => {
            console.log('FAILED...', error.text);
            setSending(false);
            
            toast.error(`Failed to send email: ${error.text}`, {
              position: "bottom-right",
              duration: 3000,
            });
          }
        );
    }
  };

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} closeOnOutsideClick={false} onClose={onClose}>
      <div className="w-[32rem] flex flex-col">
        <p className="text-lg font-semibold mb-4">Send Interview Link via Email</p>
        
        <form ref={formRef} onSubmit={handleSendEmails}>
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
            {/* Hidden fields for EmailJS template */}
            <input 
              type="hidden" 
              name="to_email" 
              value={dummyEmails
                .filter(email => selectedEmails.includes(email.id))
                .map(email => email.email)
                .join(", ")} 
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
