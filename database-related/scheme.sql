create table book (
    id          int auto_increment primary key,
    title       varchar(255),
    author      varchar(255),
    press       varchar(255),
    category    varchar(255),
    year        decimal(4),
    price       decimal(8,2) not null check (price >= 0),
    total       int not null check (total >= 0),
    stock       int not null check (stock >= 0),
    constraint book_chk_total_gt_stock check (total >= stock)
);

create table card (
    id          int auto_increment primary key,
    name        varchar(255),
    address     varchar(255),
    type        enum('Teacher', 'Student') not null
);

create table manager (
    id          int auto_increment primary key,
    name        varchar(255) not null,
    password    varchar(255) not null check (length(password) >= 8),
    phone       varchar(255)
);

create table borrow (
    id          int auto_increment primary key,
    book_id     int not null,
    card_id     int not null,
    borrow_date date not null,
    due_date    date not null,
    manager_id  int,
    foreign key (book_id) references book(id) on delete restrict,
    foreign key (card_id) references card(id) on delete restrict,
    foreign key (manager_id) references manager(id) on delete set null,
    constraint borrow_chk_due_gt_borrow check (due_date >= borrow_date)
);