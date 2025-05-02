import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Modal from "@/components/dashboard/Modal";
import { Check, Mail, Search, X } from "lucide-react";
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
  const [sending, setSending] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  const filteredEmails = dummyEmails.filter(email => 
    email.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEmails.length === 0) {
      toast.error("Please select at least one recipient.", {
        position: "bottom-right",
        duration: 3000,
      });
      return;
    }

    setSending(true);
    setSent(false); // Reset sent state before sending

    const defaultMessage = `Check out this interview: ${shareUrl}`;
    
    const emailPromises = selectedEmails.map(id => {
      const recipient = dummyEmails.find(email => email.id === id);
      if (!recipient) return Promise.reject(new Error(`Email ID ${id} not found`));

      const templateParams = {
        email: recipient.email,
        message: defaultMessage,
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
               message: defaultMessage, 
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
      <div className="w-[32rem] flex flex-col bg-white rounded-xl overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Mail className="mr-3 text-indigo-600" size={20} />
            Share Interview via Email
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full h-8 w-8 hover:bg-gray-100"
          >
            <X size={18} />
          </Button>
        </div>
        
        <form onSubmit={handleSendEmails} className="p-5">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Recipients</h3>
              <Button 
                variant="outline" 
                size="sm" 
                type="button"
                onClick={handleSelectAll}
                className="text-xs hover:bg-indigo-50 hover:text-indigo-600 border-indigo-200"
              >
                {selectedEmails.length === dummyEmails.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search recipients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md shadow-sm bg-gray-50">
              {filteredEmails.length > 0 ? (
                filteredEmails.map(email => (
                  <div key={email.id} className="flex items-center p-3 border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors duration-150">
                    <input
                      type="checkbox"
                      id={`email-${email.id}`}
                      checked={selectedEmails.includes(email.id)}
                      onChange={() => handleSelectEmail(email.id)}
                      className="mr-3 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-opacity-25"
                    />
                    <label htmlFor={`email-${email.id}`} className="flex-1 cursor-pointer text-gray-700 font-medium">
                      {email.email}
                    </label>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No matching recipients found</div>
              )}
            </div>
            
            <p className="mt-2 text-xs text-gray-500">
              Selected {selectedEmails.length} of {dummyEmails.length} recipients
            </p>
          </div>
          
          <input type="hidden" name="interview_url" value={shareUrl} />
          
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="mr-3 border-gray-300 hover:bg-gray-50"
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex items-center bg-indigo-600 hover:bg-indigo-700 transition-colors"
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
                  Sent Successfully
                </>
              ) : (
                <>
                  <Mail size={16} className="mr-2" />
                  Send Email{selectedEmails.length > 0 ? ` (${selectedEmails.length})` : ''}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default EmailPopup; 
