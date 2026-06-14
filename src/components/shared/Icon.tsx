'use client';

import { config, findIconDefinition, library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';

// Prevent FontAwesome from auto-adding CSS (important for Next.js)
config.autoAddCss = false;

// Add all solid icons to the library
library.add(fas);

// Size mapping
const SIZE_MAP: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-2xl',
};

// Pixel size mapping for FontAwesome
const PX_SIZE_MAP: Record<string, number> = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

interface IconProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Icon({ icon, size = 'md', className }: IconProps) {
  const iconDef = findIconDefinition({ prefix: 'fas', iconName: icon });

  if (!iconDef) {
    // Fallback: return a small placeholder
    return (
      <span
        className={cn('inline-block', SIZE_MAP[size], className)}
        style={{ width: PX_SIZE_MAP[size], height: PX_SIZE_MAP[size] }}
      />
    );
  }

  return (
    <FontAwesomeIcon
      icon={iconDef}
      className={cn(SIZE_MAP[size], className)}
      style={{ width: PX_SIZE_MAP[size], height: PX_SIZE_MAP[size] }}
    />
  );
}

// Icon map for the exam platform - maps friendly names to FontAwesome icon names
export const ICON_MAP: Record<string, string> = {
  // Education & Platform
  faGraduationCap: 'graduation-cap',
  faChalkboardTeacher: 'chalkboard-user',
  faBook: 'book',
  faQuestion: 'question',
  faFileAlt: 'file-lines',
  faMagic: 'wand-magic-sparkles',
  faEye: 'eye',

  // Question types
  faListUl: 'list-ul',
  faCheckSquare: 'square-check',
  faRightLeft: 'right-left',
  faFont: 'font',
  faAlignLeft: 'align-left',

  // Actions
  faDownload: 'download',
  faUpload: 'upload',
  faExclamationTriangle: 'triangle-exclamation',
  faWarning: 'circle-exclamation',

  // CRUD
  faPlus: 'plus',
  faEdit: 'pen-to-square',
  faTrash: 'trash-can',
  faSearch: 'magnifying-glass',
  faFilter: 'filter',
  faChevronLeft: 'chevron-left',
  faChevronRight: 'chevron-right',

  // Dashboard & Monitoring
  faClock: 'clock',
  faUsers: 'users',
  faChartBar: 'chart-bar',
  faShieldAlt: 'shield-halved',
  faLock: 'lock',

  // Playback & Controls
  faPlay: 'play',
  faStop: 'stop',
  faRedo: 'rotate-right',
  faSave: 'floppy-disk',
  faTimes: 'xmark',
  faCheck: 'check',

  // Special
  faCircleDot: 'circle-dot',
  faSquareCheck: 'square-check',
  faStar: 'star',
  faBolt: 'bolt',
  faBrain: 'brain',

  // Navigation
  faBars: 'bars',
  faHome: 'house',
  faSignOut: 'right-from-bracket',
  faArrowLeft: 'arrow-left',
  faArrowRight: 'arrow-right',
  faCog: 'gear',
  faBell: 'bell',
  faUser: 'user',
  faCircleInfo: 'circle-info',
  faFolder: 'folder',
  faFolderOpen: 'folder-open',
  faTag: 'tag',
  faHashtag: 'hashtag',
  faLayerGroup: 'layer-group',
  faFileExport: 'file-export',
  faFileImport: 'file-import',
  faSpinner: 'spinner',
  faWifi: 'wifi',
  faExclamationCircle: 'circle-exclamation',
  faBan: 'ban',
  faFlag: 'flag',
  faSignal: 'signal',
  faDesktop: 'desktop',
  faMobileScreen: 'mobile-screen',
  faExpand: 'expand',
  faCompress: 'compress',
  faCirclePause: 'circle-pause',
  faCirclePlay: 'circle-play',
  faCircleCheck: 'circle-check',
  faCircleXmark: 'circle-xmark',
  faArrowUp: 'arrow-up',
  faArrowDown: 'arrow-down',
  faEllipsisVertical: 'ellipsis-vertical',
  faPencil: 'pencil',
  faCopy: 'copy',
  faLink: 'link',
  faExternalLink: 'arrow-up-right-from-square',
  faPrint: 'print',
  faShare: 'share-nodes',
  faDatabase: 'database',
  faServer: 'server',
  faMicrochip: 'microchip',
  faRobot: 'robot',
  faWandMagicSparkles: 'wand-magic-sparkles',
};

// Helper to get icon name from the ICON_MAP
export function getIconName(key: string): string {
  return ICON_MAP[key] || key;
}
