// Optimierte Ant Design Imports für besseres Tree-Shaking
// Diese Datei zentralisiert alle Ant Design Imports und ermöglicht bessere Bundle-Optimierung

// Layout Components
export { Layout, Row, Col, Space, Divider } from 'antd';

// Navigation
export { Menu, Breadcrumb, Dropdown, Pagination, Steps, Tabs } from 'antd';

// Data Entry
export { 
  Form, Input, InputNumber, Select, Checkbox, Radio, Switch, Slider,
  DatePicker, TimePicker, Upload, Rate, Transfer, TreeSelect, Cascader,
  Mentions, AutoComplete 
} from 'antd';

// Data Display
export { 
  Table, Card, Avatar, Badge, Calendar, Carousel, Collapse,
  Descriptions, Empty, Image, List, Popover, Statistic, Tree,
  Timeline, Tag, Tooltip 
} from 'antd';

// Feedback
export { 
  Alert, Drawer, Modal, Progress,
  Result, Skeleton, Spin 
} from 'antd';

// General
export { Button, Typography, ConfigProvider, App } from 'antd';

// Message und Notification als separate Imports
import { message, notification } from 'antd';
export { message, notification };

// Icons (nur die am häufigsten verwendeten)
export { 
  UserOutlined, SettingOutlined, DashboardOutlined, MenuOutlined,
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, EyeInvisibleOutlined, DownloadOutlined, UploadOutlined,
  SaveOutlined, CloseOutlined, CheckOutlined, ExclamationCircleOutlined,
  InfoCircleOutlined, WarningOutlined, CheckCircleOutlined, LoadingOutlined,
  ReloadOutlined, SyncOutlined, CalendarOutlined, ClockCircleOutlined,
  FileOutlined, FolderOutlined, MailOutlined, PhoneOutlined,
  EnvironmentOutlined, LinkOutlined, ShareAltOutlined, HeartOutlined,
  StarOutlined, LikeOutlined, DislikeOutlined, MoreOutlined,
  EllipsisOutlined, UpOutlined, DownOutlined, LeftOutlined, RightOutlined,
  ArrowUpOutlined, ArrowDownOutlined, ArrowLeftOutlined, ArrowRightOutlined,
  HomeOutlined, ShoppingCartOutlined, ShoppingOutlined, BankOutlined,
  DollarOutlined, EuroOutlined, PoundOutlined, BarChartOutlined,
  LineChartOutlined, PieChartOutlined, AreaChartOutlined
} from '@ant-design/icons'; 