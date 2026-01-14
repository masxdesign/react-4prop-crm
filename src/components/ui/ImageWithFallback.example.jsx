import React from 'react';
import ImageWithFallback from './ImageWithFallback';

const ImageWithFallbackExample = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">ImageWithFallback Component Examples</h1>
      
      {/* Basic Examples */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Basic Usage</h2>
        <div className="grid grid-cols-3 gap-4">
          
          {/* Working Image */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-lg overflow-hidden mx-auto mb-2 border">
              <ImageWithFallback
                src="https://via.placeholder.com/64x64"
                alt="Working Image"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
                    No Image
                  </div>
                }
              />
            </div>
            <p className="text-sm text-gray-600">Working Image</p>
          </div>
          
          {/* Broken Image with Custom Fallback */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-lg overflow-hidden mx-auto mb-2 border">
              <ImageWithFallback
                src="https://broken-url.com/image.jpg"
                alt="Broken Image"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-red-100 flex items-center justify-center text-red-600 text-xs">
                    Failed
                  </div>
                }
              />
            </div>
            <p className="text-sm text-gray-600">Broken Image</p>
          </div>
          
          {/* No src provided */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-lg overflow-hidden mx-auto mb-2 border">
              <ImageWithFallback
                alt="No Source"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">
                    Empty
                  </div>
                }
              />
            </div>
            <p className="text-sm text-gray-600">No Source</p>
          </div>
        </div>
      </section>

      {/* Avatar Examples */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Avatar Examples</h2>
        <div className="grid grid-cols-4 gap-4">
          
          {/* Purple Gradient Avatar */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2">
              <ImageWithFallback
                src="https://broken-url.com/avatar1.jpg"
                alt="Jane Smith"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    JS
                  </div>
                }
              />
            </div>
            <p className="text-sm text-gray-600">Purple Gradient</p>
          </div>
          
          {/* Blue Gradient Avatar */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2">
              <ImageWithFallback
                src="https://broken-url.com/avatar2.jpg"
                alt="Mike Johnson"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    MJ
                  </div>
                }
              />
            </div>
            <p className="text-sm text-gray-600">Blue Gradient</p>
          </div>
          
          {/* Green Gradient Avatar */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2">
              <ImageWithFallback
                src="https://broken-url.com/avatar3.jpg"
                alt="Sarah Wilson"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-medium">
                    SW
                  </div>
                }
              />
            </div>
            <p className="text-sm text-gray-600">Green Gradient</p>
          </div>
          
          {/* Working Avatar */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2">
              <ImageWithFallback
                src="https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=ET"
                alt="Emma Thompson"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-linear-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white text-sm font-medium">
                    ET
                  </div>
                }
              />
            </div>
            <p className="text-sm text-gray-600">Working Avatar</p>
          </div>
        </div>
      </section>

      {/* Different Sizes */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Different Sizes</h2>
        <div className="flex items-center gap-4">
          
          {/* Small */}
          <div className="text-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mx-auto mb-2">
              <ImageWithFallback
                src="https://broken-url.com/small.jpg"
                alt="Small Avatar"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                    TB
                  </div>
                }
              />
            </div>
            <p className="text-xs text-gray-600">Small (32px)</p>
          </div>
          
          {/* Medium */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2">
              <ImageWithFallback
                src="https://broken-url.com/medium.jpg"
                alt="Medium Avatar"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    AD
                  </div>
                }
              />
            </div>
            <p className="text-xs text-gray-600">Medium (48px)</p>
          </div>
          
          {/* Large */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-2">
              <ImageWithFallback
                src="https://broken-url.com/large.jpg"
                alt="Large Avatar"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-lg font-medium">
                    RM
                  </div>
                }
              />
            </div>
            <p className="text-xs text-gray-600">Large (80px)</p>
          </div>
        </div>
      </section>

      {/* Custom Fallback Content */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Custom Fallback Content</h2>
        <div className="grid grid-cols-3 gap-4">
          
          {/* Icon Fallback */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-lg overflow-hidden mx-auto mb-2 border">
              <ImageWithFallback
                src="https://broken-url.com/logo.jpg"
                alt="Company Logo"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                }
              />
            </div>
            <p className="text-sm text-gray-600">Icon Fallback</p>
          </div>
          
          {/* Text Fallback */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-lg overflow-hidden mx-auto mb-2 border">
              <ImageWithFallback
                src="https://broken-url.com/product.jpg"
                alt="Product Image"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-medium">
                    No Image
                  </div>
                }
              />
            </div>
            <p className="text-sm text-gray-600">Text Fallback</p>
          </div>
          
          {/* Complex Fallback */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-lg overflow-hidden mx-auto mb-2 border">
              <ImageWithFallback
                src="https://broken-url.com/complex.jpg"
                alt="Complex Fallback"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-linear-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center text-white">
                    <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs">User</span>
                  </div>
                }
              />
            </div>
            <p className="text-sm text-gray-600">Complex Fallback</p>
          </div>
        </div>
      </section>

      {/* Real World Usage */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Real World Usage</h2>
        
        {/* Agent Card Example */}
        <div className="bg-white rounded-lg border p-4 max-w-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
              <ImageWithFallback
                src="https://broken-url.com/agent.jpg"
                alt="Agent Profile"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    ET
                  </div>
                }
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Emma Thompson</h3>
              <p className="text-sm text-gray-600">Senior Property Agent</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ImageWithFallbackExample;