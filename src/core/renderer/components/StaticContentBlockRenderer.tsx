/**
 * Static Content Block Renderer
 * Same as ContentBlockRenderer but without React hooks (for static HTML export)
 * Uses details/summary for FAQ instead of useState
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ContentBlock } from '@/core/parser/netralParser';

interface StaticContentBlockRendererProps {
  block: ContentBlock;
}

export function StaticContentBlockRenderer({ block }: StaticContentBlockRendererProps) {
  switch (block.type) {
    case 'markdown':
      const html = DOMPurify.sanitize(marked.parse(block.content) as string);
      return (
        <div
          className="prose-content mb-6 max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );

    case 'image':
      return (
        <figure className="my-8 max-w-4xl mx-auto">
          <img
            src={block.url}
            alt="Content image"
            className="w-full h-auto rounded-xl shadow-lg"
            loading="lazy"
          />
        </figure>
      );

    case 'bigtitle':
      return (
        <h2 
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center my-12 px-4"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          {block.text}
        </h2>
      );

    case 'element':
      return (
        <div className="flex flex-wrap justify-center gap-6 my-8">
          {block.items.map((item, index) => (
            <div
              key={index}
              className="card-hover rounded-xl overflow-hidden shadow-md border w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm"
              style={{ 
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))'
              }}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-5">
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'hsl(var(--card-foreground))' }}
                >
                  {item.title}
                </h3>
                <p style={{ color: 'hsl(var(--muted-foreground))' }} className="text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      );

    case 'column':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 max-w-4xl mx-auto">
          <div className="prose-content" style={{ color: 'hsl(var(--foreground))' }}>
            {block.left}
          </div>
          <div className="prose-content" style={{ color: 'hsl(var(--foreground))' }}>
            {block.right}
          </div>
        </div>
      );

    case 'feature':
      return (
        <div className="flex flex-wrap justify-center gap-6 my-8">
          {block.items.map((item, index) => (
            <div
              key={index}
              className="card-hover p-6 rounded-xl border w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm"
              style={{ 
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))'
              }}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 
                className="text-lg font-semibold mb-2"
                style={{ color: 'hsl(var(--card-foreground))' }}
              >
                {item.title}
              </h3>
              <p style={{ color: 'hsl(var(--muted-foreground))' }} className="text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      );

    case 'testimonial':
      return (
        <div className="flex flex-wrap justify-center gap-6 my-8">
          {block.items.map((item, index) => (
            <div
              key={index}
              className="card-hover p-6 rounded-xl border w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm"
              style={{ 
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))'
              }}
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" style={{ color: 'hsl(var(--warning))' }} viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p 
                className="italic mb-4"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                "{item.text}"
              </p>
              <div className="flex items-center gap-3">
                {item.photo && (
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30"
                  />
                )}
                <div>
                  <p 
                    className="font-semibold"
                    style={{ color: 'hsl(var(--card-foreground))' }}
                  >
                    {item.name}
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'pricing':
      return (
        <div className="flex flex-wrap justify-center gap-6 my-8">
          {block.items.map((item, index) => (
            <div
              key={index}
              className="card-hover p-6 rounded-xl border text-center w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm"
              style={{ 
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))'
              }}
            >
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ color: 'hsl(var(--card-foreground))' }}
              >
                {item.title}
              </h3>
              <p 
                className="text-3xl font-bold mb-6"
                style={{ color: 'hsl(var(--primary))' }}
              >
                {item.price}
              </p>
              <ul className="space-y-3 text-left">
                {item.benefits.map((benefit, i) => (
                  <li
                    key={i}
                    className="text-sm flex items-center gap-2"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--success))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case 'stats':
      return (
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 my-8">
          {block.items.map((item, index) => (
            <div
              key={index}
              className="text-center p-4 sm:p-6 rounded-xl w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] max-w-xs card-hover"
              style={{ backgroundColor: 'hsl(var(--secondary))' }}
            >
              <p 
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2"
                style={{ color: 'hsl(var(--primary))' }}
              >
                {item.value}
              </p>
              <p 
                className="text-xs sm:text-sm font-medium"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      );

    case 'cta':
      return (
        <div 
          className="my-12 p-6 sm:p-8 md:p-12 rounded-2xl text-center max-w-4xl mx-auto"
          style={{ backgroundColor: 'hsl(var(--secondary))' }}
        >
          <h3 
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-4"
            style={{ color: 'hsl(var(--secondary-foreground))' }}
          >
            {block.title}
          </h3>
          <p 
            className="mb-6 max-w-2xl mx-auto text-sm sm:text-base"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            {block.description}
          </p>
          <a
            href={block.buttonUrl}
            className="btn-primary inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium"
          >
            {block.buttonText}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>
      );

    case 'faq':
      return (
        <div className="my-8 space-y-4 max-w-3xl mx-auto">
          {block.items.map((item, index) => (
            <details 
              key={index}
              className="faq-item border rounded-xl overflow-hidden"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              <summary
                className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors"
                style={{ backgroundColor: 'hsl(var(--card))' }}
              >
                <span className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>{item.question}</span>
                <svg className="faq-chevron w-5 h-5 transition-transform" style={{ color: 'hsl(var(--muted-foreground))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="p-4 border-t" style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      );

    case 'divider':
      if (block.style === 'wave') {
        return (
          <div className="my-12 overflow-hidden">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12">
              <path 
                d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" 
                style={{ fill: 'hsl(var(--secondary))' }}
              />
            </svg>
          </div>
        );
      }
      return (
        <hr className="my-12 border-t max-w-4xl mx-auto" style={{ borderColor: 'hsl(var(--border))' }} />
      );

    case 'gallery':
      return (
        <div className="flex flex-wrap justify-center gap-4 my-8">
          {block.items.map((item, index) => (
            <figure key={index} className="group relative overflow-hidden rounded-xl w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] max-w-xs">
              <img
                src={item.url}
                alt={item.caption}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              {item.caption && (
                <figcaption 
                  className="absolute bottom-0 left-0 right-0 p-3 text-sm font-medium bg-gradient-to-t from-black/70 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      );

    case 'timeline':
      return (
        <div className="my-8 max-w-3xl mx-auto">
          <div className="relative">
            <div 
              className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 transform sm:-translate-x-1/2"
              style={{ backgroundColor: 'hsl(var(--border))' }}
            />
            {block.items.map((item, index) => (
              <div 
                key={index} 
                className={`relative flex items-start gap-4 mb-8 ${index % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'sm:text-right' : ''} pl-12 sm:pl-0`}>
                  <div 
                    className="card-hover p-4 rounded-xl border inline-block max-w-md"
                    style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  >
                    <div className="flex items-center gap-2 mb-2" style={{ color: 'hsl(var(--primary))' }}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span className="text-sm font-medium">{item.date}</span>
                    </div>
                    <h4 className="font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>{item.title}</h4>
                    <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{item.description}</p>
                  </div>
                </div>
                <div 
                  className="absolute left-4 sm:left-1/2 w-3 h-3 rounded-full transform -translate-x-1/2 mt-6 ring-4 ring-background bg-primary"
                />
                <div className="flex-1 hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      );

    case 'team':
      return (
        <div className="flex flex-wrap justify-center gap-6 my-8">
          {block.items.map((item, index) => (
            <div
              key={index}
              className="card-hover text-center p-6 rounded-xl border w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-xs"
              style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
            >
              {item.photo && (
                <img
                  src={item.photo}
                  alt={item.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-primary/20"
                />
              )}
              <h4 className="font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>{item.name}</h4>
              <p className="text-sm mb-2" style={{ color: 'hsl(var(--primary))' }}>{item.role}</p>
              {item.bio && (
                <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{item.bio}</p>
              )}
            </div>
          ))}
        </div>
      );

    case 'countdown':
      return (
        <div 
          className="my-8 p-6 sm:p-8 rounded-2xl text-center max-w-2xl mx-auto"
          style={{ backgroundColor: 'hsl(var(--secondary))' }}
        >
          <div className="flex items-center justify-center gap-2 mb-4" style={{ color: 'hsl(var(--primary))' }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-sm font-medium uppercase tracking-wider">{block.label}</span>
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
            {block.date}
          </p>
          {block.description && (
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{block.description}</p>
          )}
        </div>
      );

    case 'warn':
      return (
        <div 
          className="flex items-start gap-3 p-4 rounded-lg my-4 border max-w-3xl mx-auto"
          style={{ 
            backgroundColor: 'hsl(var(--warning) / 0.1)',
            borderColor: 'hsl(var(--warning))'
          }}
        >
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--warning))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p style={{ color: 'hsl(var(--foreground))' }}>{block.text}</p>
        </div>
      );

    case 'def':
      return (
        <div 
          className="flex items-start gap-3 p-4 rounded-lg my-4 border max-w-3xl mx-auto"
          style={{ 
            backgroundColor: 'hsl(var(--info) / 0.1)',
            borderColor: 'hsl(var(--info))'
          }}
        >
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--info))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p style={{ color: 'hsl(var(--foreground))' }}>{block.text}</p>
        </div>
      );

    case 'quote':
      return (
        <blockquote 
          className="flex items-start gap-3 p-6 my-6 border-l-4 rounded-r-lg max-w-3xl mx-auto"
          style={{ 
            backgroundColor: 'hsl(var(--muted))',
            borderColor: 'hsl(var(--primary))'
          }}
        >
          <svg className="w-6 h-6 flex-shrink-0" style={{ color: 'hsl(var(--primary))' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
          </svg>
          <p className="italic text-lg" style={{ color: 'hsl(var(--foreground))' }}>{block.text}</p>
        </blockquote>
      );

    case 'embed':
      return (
        <div className="my-8 rounded-xl overflow-hidden border max-w-4xl mx-auto" style={{ borderColor: 'hsl(var(--border))' }}>
          <iframe
            src={block.url}
            className="w-full h-96"
            title="Embedded content"
            loading="lazy"
          />
        </div>
      );

    case 'video':
      return (
        <div className="my-8 max-w-4xl mx-auto">
          <video
            src={block.url}
            controls
            className="w-full rounded-xl shadow-lg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );

    case 'badge':
      return (
        <span 
          className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
          style={{ 
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))'
          }}
        >
          {block.text}
        </span>
      );

    case 'progress':
      return (
        <div className="my-4 max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            {block.label && (
              <span className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>{block.label}</span>
            )}
            <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{block.value}%</span>
          </div>
          <div 
            className="w-full h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: 'hsl(var(--muted))' }}
          >
            <div 
              className="h-full rounded-full"
              style={{ 
                width: `${block.value}%`,
                backgroundColor: 'hsl(var(--primary))'
              }}
            />
          </div>
        </div>
      );

    case 'steps':
      return (
        <div className="my-8 max-w-3xl mx-auto">
          <div className="relative">
            <div 
              className="absolute left-5 top-4 bottom-4 w-0.5"
              style={{ backgroundColor: 'hsl(var(--border))' }}
            />
            {block.items.map((item, index) => (
              <div key={index} className="flex gap-4 mb-6 last:mb-0">
                <div 
                  className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md"
                  style={{ 
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))'
                  }}
                >
                  {item.number}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>
                    {item.title}
                  </h4>
                  <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'metric':
      return (
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 my-8">
          {block.items.map((item, index) => (
            <div
              key={index}
              className="card-hover p-5 rounded-xl border w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] max-w-xs"
              style={{ 
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))'
              }}
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <p 
                className="text-2xl sm:text-3xl font-bold mb-1"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                {item.value}
              </p>
              <p 
                className="text-sm mb-2"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {item.label}
              </p>
              {item.change && (
                <span 
                  className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: item.change.startsWith('+') || item.change.startsWith('↑') 
                      ? 'hsl(var(--success) / 0.15)' 
                      : item.change.startsWith('-') || item.change.startsWith('↓')
                        ? 'hsl(142 71% 45% / 0.15)'
                        : 'hsl(var(--muted))',
                    color: item.change.startsWith('+') || item.change.startsWith('↑')
                      ? 'hsl(var(--success))'
                      : item.change.startsWith('-') || item.change.startsWith('↓')
                        ? 'hsl(0 84% 60%)'
                        : 'hsl(var(--muted-foreground))'
                  }}
                >
                  {item.change}
                </span>
              )}
            </div>
          ))}
        </div>
      );

    case 'showcase':
      return (
        <div 
          className="my-10 rounded-2xl overflow-hidden border shadow-xl max-w-4xl mx-auto"
          style={{ 
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))'
          }}
        >
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-square md:aspect-auto overflow-hidden">
              <img
                src={block.image}
                alt={block.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div 
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.1) 0%, transparent 100%)' }}
              />
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <h3 
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                {block.title}
              </h3>
              <p 
                className="text-base mb-6"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {block.subtitle}
              </p>
              {block.specs && block.specs.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {block.specs.map((spec, idx) => (
                    <div key={idx} className="text-center p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {spec.label}
                      </p>
                      <p className="text-lg font-bold" style={{ color: 'hsl(var(--primary))' }}>
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
