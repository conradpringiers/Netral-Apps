/**
 * Unified Slide Block Renderer
 * Uses inline styles for consistent rendering across all environments
 * All sizes optimized for 1920x1080 fixed resolution (scaled by ScaledSlide)
 * Supports adaptive sizing via contentScale prop (1.0 = default, <1 = denser)
 */

import { SlideContent } from '../../parser/deckParser';
import { renderMarkdown } from '../markdownRenderer';

interface SlideBlockRendererProps {
  block: SlideContent;
  contentScale?: number;
}

/** Count total "weight" of content blocks to determine density */
export function getContentWeight(blocks: SlideContent[]): number {
  let weight = 0;
  for (const b of blocks) {
    switch (b.type) {
      case 'feature': case 'stats': weight += (b.props?.items?.length || 3); break;
      case 'timeline': case 'list': case 'agenda': weight += (b.props?.items?.length || 2) * 1.5; break;
      case 'column': weight += 3; break;
      case 'comparison': weight += 4; break;
      case 'gallery': weight += 4; break;
      case 'image': case 'video': weight += 3; break;
      case 'code': weight += 2; break;
      case 'speaker': weight += 3; break;
      default: weight += 1; break;
    }
  }
  return weight;
}

/** Compute a scale factor: fewer items = bigger text, more items = smaller */
export function computeContentScale(blocks: SlideContent[]): number {
  const weight = getContentWeight(blocks);
  if (weight <= 1) return 1.6;
  if (weight <= 2) return 1.45;
  if (weight <= 3) return 1.3;
  if (weight <= 5) return 1.2;
  if (weight <= 7) return 1.1;
  if (weight <= 10) return 1.0;
  if (weight <= 14) return 0.9;
  return 0.8;
}

function sz(base: string, scale: number): string {
  const val = parseFloat(base);
  const unit = base.replace(/[\d.]/g, '');
  return `${(val * scale).toFixed(3)}${unit}`;
}

function makeSizes(scale: number) {
  return {
    text: sz('1.5rem', scale),
    textLg: sz('1.875rem', scale),
    textXl: sz('2.25rem', scale),
    text2xl: sz('3rem', scale),
    text3xl: sz('3.75rem', scale),
    text4xl: sz('4.5rem', scale),
    heading1: sz('3rem', scale),
    heading2: sz('2.25rem', scale),
    heading3: sz('1.875rem', scale),
    icon: sz('3rem', scale),
    iconLg: sz('3.75rem', scale),
    gap: sz('2.5rem', scale),
    gapSm: sz('1.5rem', scale),
    padding: sz('2rem', scale),
    paddingSm: sz('1rem', scale),
    paddingLg: sz('2.5rem', scale),
    space: sz('1.5rem', scale),
    maxH: '600px',
    rounded: '0.75rem',
    roundedLg: '1rem',
    dotSize: sz('0.75rem', scale),
    numbCircle: sz('2.5rem', scale),
    numbText: sz('1rem', scale),
    speakerImg: sz('6rem', scale),
    badgePx: '1rem',
    badgePy: '0.375rem',
    badgeText: sz('0.875rem', scale),
    progressH: '0.75rem',
    codeText: sz('0.875rem', scale),
  };
}

export function SlideBlockRenderer({ block, contentScale = 1.0 }: SlideBlockRendererProps) {
  const s = makeSizes(contentScale);
  switch (block.type) {
    case 'markdown':
    case 'text': {
      const mdId = 'slide-md';
      return (
        <>
          <style>{`
            .${mdId} h1 { font-size: ${s.heading1}; font-weight: 700; margin-bottom: 0.75rem; color: hsl(var(--foreground)); }
            .${mdId} h2 { font-size: ${s.heading2}; font-weight: 700; margin-bottom: 0.5rem; color: hsl(var(--foreground)); }
            .${mdId} h3 { font-size: ${s.heading3}; font-weight: 600; margin-bottom: 0.5rem; color: hsl(var(--foreground)); }
            .${mdId} p { font-size: ${s.text}; line-height: 1.6; margin-bottom: 0.5rem; color: hsl(var(--foreground)); }
            .${mdId} ul, .${mdId} ol { font-size: ${s.text}; padding-left: 1.5rem; }
            .${mdId} ul { list-style-type: disc; }
            .${mdId} ol { list-style-type: decimal; }
            .${mdId} li { font-size: ${s.text}; margin-bottom: 0.25rem; }
            .${mdId} strong { font-weight: 700; }
            .${mdId} em { font-style: italic; }
            .${mdId} a { text-decoration: underline; color: hsl(var(--primary)); }
          `}</style>
          <div
            className={mdId}
            style={{ color: 'hsl(var(--foreground))', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }}
          />
        </>
      );
    }

    case 'bigtitle':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
          <h2 style={{
            fontSize: s.text4xl,
            fontWeight: 700,
            textAlign: 'center',
            color: 'hsl(var(--primary))',
            lineHeight: 1.2,
          }}>
            {block.content}
          </h2>
        </div>
      );

    case 'image':
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
          <img
            src={block.content}
            alt="Slide image"
            style={{
              maxHeight: s.maxH,
              borderRadius: s.roundedLg,
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              objectFit: 'contain',
            }}
          />
        </div>
      );

    case 'column': {
      const columns = (block.props?.columns || []) as SlideContent[][];
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: s.gapSm, alignItems: 'start' }}>
          {columns.map((colBlocks, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: s.space }}>
              {colBlocks.map((child, childIdx) => (
                <SlideBlockRenderer key={childIdx} block={child} contentScale={contentScale} />
              ))}
            </div>
          ))}
        </div>
      );
    }

    case 'feature': {
      const features = block.props?.items || [];
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: s.gap, padding: '1rem 0' }}>
          {features.map((item: { icon: string; title: string; description: string }, idx: number) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: s.iconLg, marginBottom: '0.5rem' }}>{item.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: s.textLg, marginBottom: '0.25rem', color: 'hsl(var(--foreground))' }}>{item.title}</h3>
              <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: s.text }}>{item.description}</p>
            </div>
          ))}
        </div>
      );
    }

    case 'stats': {
      const stats = block.props?.items || [];
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: s.gap, padding: '1.5rem 0' }}>
          {stats.map((item: { value: string; label: string }, idx: number) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: s.text4xl, fontWeight: 700, color: 'hsl(var(--primary))' }}>
                {item.value}
              </div>
              <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: s.textLg, marginTop: '0.25rem' }}>{item.label}</div>
            </div>
          ))}
        </div>
      );
    }

    case 'timeline': {
      const timelineItems = block.props?.items || [];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: s.space }}>
          {timelineItems.map((item: { year: string; title: string; description: string }, idx: number) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: s.gapSm }}>
              <div style={{ flexShrink: 0, fontSize: s.textLg, fontWeight: 700, color: 'hsl(var(--primary))', minWidth: '60px' }}>{item.year}</div>
              <div style={{ flexShrink: 0, width: s.dotSize, height: s.dotSize, marginTop: '0.5rem', borderRadius: '50%', backgroundColor: 'hsl(var(--primary))' }} />
              <div style={{ flex: 1, marginLeft: '0.5rem' }}>
                <h4 style={{ fontSize: s.textLg, fontWeight: 700, color: 'hsl(var(--foreground))' }}>{item.title}</h4>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: s.text, marginTop: '0.125rem' }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'list': {
      const listItems = block.props?.items || [];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: s.space }}>
          {listItems.map((item: { icon: string; text: string }, idx: number) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: s.gapSm }}>
              <span style={{ fontSize: s.icon }}>{item.icon}</span>
              <span style={{ fontSize: s.textLg, color: 'hsl(var(--foreground))' }}>{item.text}</span>
            </div>
          ))}
        </div>
      );
    }

    case 'video':
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
          <video
            src={block.content}
            controls
            playsInline
            style={{
              maxHeight: s.maxH,
              borderRadius: s.roundedLg,
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            }}
          />
        </div>
      );

    case 'code':
      return (
        <pre style={{
          overflow: 'auto',
          borderRadius: s.rounded,
          padding: s.paddingSm,
          backgroundColor: 'hsl(var(--muted))',
          color: 'hsl(var(--foreground))',
          fontFamily: 'monospace',
          fontSize: s.codeText,
        }}>
          <code>{block.content.trim()}</code>
        </pre>
      );

    case 'warn':
      return (
        <div style={{
          padding: s.padding,
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderLeft: '4px solid rgb(245, 158, 11)',
          borderRadius: s.rounded,
        }}>
          <span style={{ color: 'rgb(217, 119, 6)', fontSize: s.textLg, fontWeight: 500 }}>⚠️ {block.content}</span>
        </div>
      );

    case 'def':
      return (
        <div style={{
          padding: s.padding,
          backgroundColor: 'hsl(var(--primary) / 0.1)',
          borderLeft: '4px solid hsl(var(--primary))',
          borderRadius: s.rounded,
        }}>
          <span style={{ color: 'hsl(var(--primary))', fontSize: s.textLg, fontWeight: 500 }}>ℹ️ {block.content}</span>
        </div>
      );

    case 'quote':
      return (
        <blockquote style={{
          fontSize: s.text2xl,
          fontStyle: 'italic',
          color: 'hsl(var(--muted-foreground))',
          borderLeft: '4px solid hsl(var(--primary))',
          paddingLeft: '1.5rem',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
        }}>
          "{block.content}"
        </blockquote>
      );

    case 'badge':
      return (
        <span style={{
          display: 'inline-block',
          paddingLeft: s.badgePx,
          paddingRight: s.badgePx,
          paddingTop: s.badgePy,
          paddingBottom: s.badgePy,
          borderRadius: '9999px',
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          fontWeight: 600,
          fontSize: s.badgeText,
        }}>
          {block.content}
        </span>
      );

    case 'gallery': {
      const galleryItems = block.props?.items || [];
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: s.gapSm, padding: '0.5rem 0' }}>
          {galleryItems.slice(0, 6).map((item: { url: string; caption: string }, idx: number) => (
            <div key={idx} style={{ position: 'relative' }}>
              <img
                src={item.url}
                alt={item.caption}
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  objectFit: 'cover',
                  borderRadius: s.rounded,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              {item.caption && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  fontSize: '0.75rem',
                  padding: '0.5rem',
                  textAlign: 'center',
                  borderBottomLeftRadius: s.rounded,
                  borderBottomRightRadius: s.rounded,
                }}>
                  {item.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    case 'progress': {
      const progressValue = block.props?.value || 0;
      const progressLabel = block.props?.label;
      return (
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            {progressLabel && (
              <span style={{ fontSize: s.text, color: 'hsl(var(--foreground))' }}>{progressLabel}</span>
            )}
            <span style={{ fontSize: s.text, color: 'hsl(var(--muted-foreground))', marginLeft: 'auto' }}>{progressValue}%</span>
          </div>
          <div style={{
            width: '100%',
            height: s.progressH,
            backgroundColor: 'hsl(var(--muted))',
            borderRadius: s.rounded,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressValue}%`,
              backgroundColor: 'hsl(var(--primary))',
              borderRadius: s.rounded,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      );
    }

    case 'graph': {
      const graphNodes = block.props?.nodes || [];
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: s.gap, flexWrap: 'wrap', padding: '1rem 0' }}>
          {graphNodes.map((node: { id: string; label: string; connections: string[] }, idx: number) => (
            <div key={node.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                borderRadius: '0.5rem',
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                fontWeight: 500,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}>
                {node.label}
              </div>
              {node.connections.length > 0 && idx < graphNodes.length - 1 && (
                <div style={{ margin: '0 0.75rem', display: 'flex', alignItems: 'center', color: 'hsl(var(--muted-foreground))' }}>
                  <div style={{ width: '2rem', height: '2px', backgroundColor: 'hsl(var(--border))' }} />
                  <span style={{ fontSize: '1.125rem' }}>→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    case 'comparison': {
      const comparisonItems = block.props?.items || [];
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: s.gap, padding: '1rem 0' }}>
          {comparisonItems.map((item: { title: string; items: string[] }, idx: number) => (
            <div
              key={idx}
              style={{
                padding: s.padding,
                borderRadius: s.rounded,
                border: '1px solid hsl(var(--border))',
                backgroundColor: idx === 0 ? 'hsl(var(--muted))' : 'hsl(var(--primary) / 0.1)',
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: s.textXl, marginBottom: '1rem', textAlign: 'center', color: 'hsl(var(--foreground))' }}>{item.title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: s.space }}>
                {item.items.map((text, i) => (
                  <div key={i} style={{ fontSize: s.text, color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'agenda': {
      const agendaItems = block.props?.items || [];
      return (
        <div style={{ padding: '1rem 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {agendaItems.map((item: { number: string; title: string; duration: string }, idx: number) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: s.gapSm,
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: s.rounded,
                  background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)',
                  borderLeft: '4px solid hsl(var(--primary))',
                }}
              >
                <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: s.gapSm, flex: 1 }}>
                  <div style={{
                    flexShrink: 0,
                    width: s.numbCircle,
                    height: s.numbCircle,
                    fontSize: s.numbText,
                    borderRadius: '50%',
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}>
                    {item.number}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: 700, fontSize: s.text, color: 'hsl(var(--foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h4>
                  </div>
                  <div style={{
                    flexShrink: 0,
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                    borderRadius: '9999px',
                    fontWeight: 500,
                    backgroundColor: 'hsl(var(--primary) / 0.2)',
                    color: 'hsl(var(--primary))',
                  }}>
                    ⏱ {item.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'speaker': {
      const speakerData = block.props || {};
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s.gap, padding: '1.5rem 0' }}>
          {speakerData.photo && (
            <img
              src={speakerData.photo}
              alt={speakerData.name || 'Speaker'}
              style={{
                width: s.speakerImg,
                height: s.speakerImg,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid hsl(var(--primary))',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              }}
            />
          )}
          <blockquote style={{
            fontSize: s.textLg,
            fontStyle: 'italic',
            textAlign: 'center',
            maxWidth: '40rem',
            lineHeight: 1.6,
            color: 'hsl(var(--foreground))',
          }}>
            "{speakerData.quote}"
          </blockquote>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: s.text, color: 'hsl(var(--foreground))' }}>
              {speakerData.name}
            </p>
            {speakerData.role && (
              <p style={{ fontSize: '1rem', color: 'hsl(var(--muted-foreground))' }}>
                {speakerData.role}
              </p>
            )}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

export default SlideBlockRenderer;
