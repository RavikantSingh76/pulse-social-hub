import React, { useState } from 'react';
import { Modal } from './Modal';
import { postService } from '../../services/services';
import toast from 'react-hot-toast';

export const ReportModal = ({ isOpen, onClose, postId }) => {
  const [reason, setReason] = useState('SPAM');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await postService.reportPost(postId, { reason, details });
      toast.success('Report submitted. Thank you for keeping Pulse safe.');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Post">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Why are you reporting this post?
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="SPAM">Spam or Misleading</option>
            <option value="HARASSMENT">Harassment or Bullying</option>
            <option value="HATE_SPEECH">Hate Speech or Symbols</option>
            <option value="VIOLENCE">Violence or Dangerous Content</option>
            <option value="COPYRIGHT">Intellectual Property Violation</option>
            <option value="OTHER">Other Reason</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Details (optional)
          </label>
          <textarea
            rows="3"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Please provide any additional context..."
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
