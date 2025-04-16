
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Seo } from '@/components/seo/Seo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SerpPreview from '@/components/seo/SerpPreview';
import { truncateText } from '@/utils/seoHelpers';

const SerpSnippetGenerator = () => {
  const [url, setUrl] = useState('https://example.com/page');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleChars, setTitleChars] = useState(0);
  const [descriptionChars, setDescriptionChars] = useState(0);
  
  useEffect(() => {
    setTitleChars(title.length);
  }, [title]);
  
  useEffect(() => {
    setDescriptionChars(description.length);
  }, [description]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  
  const getUrlDisplay = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch (e) {
      return url;
    }
  };

  return (
    <MainLayout>
      <Seo 
        title="SERP Snippet Generator | Optimize Your Search Result Preview"
        description="Preview how your page will appear in Google search results. Optimize your title and meta description for better click-through rates."
        keywords="SERP preview, search snippet, meta description, SEO tools, Google search results"
      />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">SERP Snippet Generator</h1>
          <p className="text-gray-600 mb-8">
            Preview how your page will appear in Google search results. Craft effective titles and descriptions to improve click-through rates.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input 
                  id="url"
                  placeholder="https://example.com/page" 
                  value={url}
                  onChange={handleUrlChange}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="title">Title</Label>
                  <span className={`text-sm ${titleChars > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                    {titleChars}/60 characters
                  </span>
                </div>
                <Input 
                  id="title"
                  placeholder="Enter your page title" 
                  value={title}
                  onChange={handleTitleChange}
                  className={titleChars > 60 ? 'border-red-300' : ''}
                />
                {titleChars > 60 && (
                  <p className="text-xs text-red-500">
                    Recommended: Keep your title under 60 characters to avoid truncation.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="description">Meta Description</Label>
                  <span className={`text-sm ${descriptionChars > 155 ? 'text-red-500' : 'text-gray-500'}`}>
                    {descriptionChars}/155 characters
                  </span>
                </div>
                <Textarea 
                  id="description"
                  placeholder="Enter your meta description" 
                  value={description}
                  onChange={handleDescriptionChange}
                  className={`min-h-[100px] ${descriptionChars > 155 ? 'border-red-300' : ''}`}
                />
                {descriptionChars > 155 && (
                  <p className="text-xs text-red-500">
                    Recommended: Keep your description under 155 characters to avoid truncation.
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">SERP Preview</h2>
              <SerpPreview 
                title={title || "Title Example - Your Brand Here"}
                description={description || "This is an example meta description that would appear in search results. Write compelling copy to improve click-through rates."}
                url={getUrlDisplay(url)}
              />
              
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h3 className="text-lg font-medium text-blue-800 mb-2">SEO Tips</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                  <li>Keep titles between 50-60 characters</li>
                  <li>Keep descriptions between 140-155 characters</li>
                  <li>Include primary keywords near the beginning</li>
                  <li>Add a call-to-action in the description</li>
                  <li>Make sure your content delivers what the snippet promises</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SerpSnippetGenerator;
