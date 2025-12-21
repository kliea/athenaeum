import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export type Paginated<T> = {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
};

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    email_verified_at: string | null;
    avatar?: string;
    position_id: number;
    status_id: number;
    created_at: string;
    position?: Position;
    status?: Status;
}

export interface Position {
    id: number;
    title: string;
}

export interface Status {
    id: number;
    title: string;
}

export interface Author {
    id: number;
    first_name: string;
    last_name: string;
}

export interface Book {
    id: number;
    title: string;
    isbn: string;
    publication_year: number | string;
    authors: Author[];
    status?: Status;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & SharedData;
