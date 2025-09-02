import React, { useState } from 'react';

interface MonitoringTargetFormProps {
  onSubmit: (data: {
    url: string;
    keywords: string[];
    selector?: string;
    name?: string;
  }) => Promise<boolean>;
  onCancel: () => void;
  initialData?: {
    url?: string;
    keywords?: string[];
    selector?: string;
    name?: string;
  };
}

export const MonitoringTargetForm: React.FC<MonitoringTargetFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    url: initialData?.url || '',
    keywords: initialData?.keywords?.join(', ') || '',
    selector: initialData?.selector || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate form
      if (!formData.url || !formData.keywords) {
        throw new Error('URL and keywords are required');
      }

      // Validate URL format
      try {
        new URL(formData.url);
      } catch {
        throw new Error('Please enter a valid URL');
      }

      // Parse keywords
      const keywords = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (keywords.length === 0) {
        throw new Error('At least one keyword is required');
      }

      const submitData = {
        url: formData.url,
        keywords,
        selector: formData.selector.trim() || undefined,
        name: formData.name.trim() || undefined,
      };

      const success = await onSubmit(submitData);
      if (!success) {
        throw new Error('Failed to save monitoring target');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Target Name (Optional)
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., LinkedIn Jobs, Amazon Products"
        />
        <p className="mt-1 text-sm text-gray-500">Give your target a friendly name</p>
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
          Website URL *
        </label>
        <input
          type="url"
          id="url"
          required
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com/jobs"
        />
        <p className="mt-1 text-sm text-gray-500">The webpage you want to monitor</p>
      </div>

      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
          Keywords *
        </label>
        <input
          type="text"
          id="keywords"
          required
          value={formData.keywords}
          onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="fullstack, react developer, product manager"
        />
        <p className="mt-1 text-sm text-gray-500">
          Comma-separated keywords to search for (e.g., "fullstack in lille", "react developer")
        </p>
      </div>

      <div>
        <label htmlFor="selector" className="block text-sm font-medium text-gray-700">
          CSS Selector (Optional)
        </label>
        <input
          type="text"
          id="selector"
          value={formData.selector}
          onChange={(e) => setFormData({ ...formData, selector: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder=".job-listings, #content, .product-list"
        />
        <p className="mt-1 text-sm text-gray-500">
          Target specific part of the page (leave empty to scan entire page)
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Target'}
        </button>
      </div>
    </form>
  );
};