import { useState, useRef, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Flattens tree data into a list of visible nodes based on expanded state
 */
function flattenTree(items, expandedIds, depth = 0, parentPath = '') {
  const result = [];

  items.forEach((item) => {
    const path = parentPath ? `${parentPath}/${item.id}` : item.id;
    result.push({ ...item, depth, path });

    if (item.children && expandedIds.has(item.id)) {
      result.push(...flattenTree(item.children, expandedIds, depth + 1, path));
    }
  });

  return result;
}

/**
 * Collects all folder IDs from tree
 */
function getAllFolderIds(items) {
  const ids = [];
  items.forEach((item) => {
    if (item.children) {
      ids.push(item.id);
      ids.push(...getAllFolderIds(item.children));
    }
  });
  return ids;
}

/**
 * Filters tree by search query, keeping parent structure
 */
function filterTree(items, query) {
  if (!query.trim()) return { items, expandedIds: new Set() };

  const searchLower = query.toLowerCase();
  const expandedIds = new Set();

  const itemMatches = (item) => {
    if (item.name.toLowerCase().includes(searchLower)) return true;
    if (item.children) {
      return item.children.some((child) => itemMatches(child));
    }
    return false;
  };

  const filter = (items) => {
    return items
      .map((item) => {
        if (!item.children) {
          return itemMatches(item) ? item : null;
        }

        const filteredChildren = filter(item.children);
        if (filteredChildren.length > 0 || item.name.toLowerCase().includes(searchLower)) {
          expandedIds.add(item.id);
          return { ...item, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean);
  };

  return { items: filter(items), expandedIds };
}

export default function VirtualizedTree({
  data,
  getIcon,
  searchPlaceholder = 'Search...',
  showExpandAll = true,
  rowHeight = 36,
  className,
  autoExpandMatch, // (item) => boolean - auto-expand children matching this predicate when parent expands
}) {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const parentRef = useRef(null);

  // Build a map of item IDs to their data for quick lookup
  const itemMap = useMemo(() => {
    const map = new Map();
    const buildMap = (items) => {
      items.forEach((item) => {
        map.set(item.id, item);
        if (item.children) buildMap(item.children);
      });
    };
    buildMap(data);
    return map;
  }, [data]);

  // Filter and flatten tree
  const { filteredData, searchExpandedIds } = useMemo(() => {
    const { items, expandedIds } = filterTree(data, searchQuery);
    return { filteredData: items, searchExpandedIds: expandedIds };
  }, [data, searchQuery]);

  // Merge expanded IDs with search-expanded IDs
  const effectiveExpandedIds = useMemo(() => {
    return new Set([...expandedIds, ...searchExpandedIds]);
  }, [expandedIds, searchExpandedIds]);

  // Flatten visible nodes
  const flatNodes = useMemo(() => {
    return flattenTree(filteredData, effectiveExpandedIds);
  }, [filteredData, effectiveExpandedIds]);

  // Virtual list
  const virtualizer = useVirtualizer({
    count: flatNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  const handleToggle = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // When expanding, also auto-expand matching children
        if (autoExpandMatch) {
          const item = itemMap.get(id);
          if (item?.children) {
            item.children.forEach((child) => {
              if (child.children && autoExpandMatch(child)) {
                next.add(child.id);
              }
            });
          }
        }
      }
      return next;
    });
  }, [autoExpandMatch, itemMap]);

  const handleExpandAll = useCallback(() => {
    setExpandedIds(new Set(getAllFolderIds(data)));
  }, [data]);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  return (
    <div className={cn('bg-background rounded-xl border shadow-sm', className)}>
      {/* Header with search and expand/collapse buttons */}
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        {showExpandAll && (
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="sm" className="h-9 px-2" onClick={handleExpandAll}>
              <ChevronDown className="h-4 w-4 mr-1" />
              Expand
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-2" onClick={handleCollapseAll}>
              <ChevronRight className="h-4 w-4 mr-1" />
              Collapse
            </Button>
          </div>
        )}
      </div>

      {/* Virtualized tree content */}
      <div
        ref={parentRef}
        className="h-[500px] overflow-auto"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const node = flatNodes[virtualRow.index];
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = effectiveExpandedIds.has(node.id);

            return (
              <div
                key={node.path}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex items-center px-4 hover:bg-muted/50 cursor-default"
              >
                {/* Indentation */}
                <div style={{ width: `${node.depth * 20}px` }} />

                {/* Expand/collapse button or spacer */}
                {hasChildren ? (
                  <button
                    onClick={() => handleToggle(node.id)}
                    className="h-6 w-6 flex items-center justify-center hover:bg-muted rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                ) : (
                  <div className="w-6" />
                )}

                {/* Icon */}
                {getIcon && (
                  <span className="mr-2 flex-shrink-0">
                    {getIcon(node, node.depth)}
                  </span>
                )}

                {/* Label */}
                <span className="truncate text-sm">{node.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with stats */}
      <div className="px-4 py-2 border-t text-xs text-muted-foreground">
        {flatNodes.length} items visible
      </div>
    </div>
  );
}
