export interface ScheduleEvent {
  id: number;
  title: string;
  description: string;
  livestream: string;
  category: string;
  tags: string;
  start_time: string;
  end_time: string;
  no_end_time: boolean;
  location: string;
  people_list: string;
  image: EventImage[];
  people: EventPerson[];
  schedule_categories: Category[];
  global_categories: Category[];
  schedule_tags: ScheduleTag[];
  video_link: string | null;
  bonus_link: string;
  bonus_link_text: string;
  epic_photo_url: string;
  venue_location: VenueLocation;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  is_public: string;
}

export interface ScheduleTag {
  tag: string;
  id: string;
}

export interface VenueLocation {
  id: string;
  name: string;
}

export interface EventImage {
  big: string;
  med: string;
  small: string;
  thumb: string;
}

export interface EventPerson {
  id: string;
  uid?: string;
  publicly_visible?: string;
  first_name: string;
  last_name: string;
  alt_name?: string;
}

interface ScheduleApiResponse {
  event_id: string;
  event_name: string;
  event_slug: string;
  schedules: ScheduleEvent[];
}

export interface ScheduleApiResponseWithMeta extends ScheduleApiResponse {
  hash: string;
  cachedAt: number;
}

export interface FilterState {
  day: string | null;
  categories: Set<string>;
  tags: Set<string>;
  locations: Set<string>;
  search: string;
  favoritesOnly: boolean;
  myScheduleView: boolean;
}
