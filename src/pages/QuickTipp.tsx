import React from 'react';
import EnhancedLayout from '@/components/layout/EnhancedLayout';

const QuickTipp = () => {
  return (
    <EnhancedLayout>
      <div className="container-custom py-6">
        <h1 className="text-3xl font-semibold mb-6">Quick Tipp</h1>
        <p className="text-gray-600">
          Hier findest du zufällige Filmempfehlungen, wenn du dich nicht entscheiden kannst.
        </p>
      </div>
    </EnhancedLayout>
  );
};

export default QuickTipp;
