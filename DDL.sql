-- Insert script --
DROP TYPE IF EXISTS roles CASCADE;
DROP TYPE IF EXISTS doses CASCADE;
DROP TYPE IF EXISTS rating CASCADE;
DROP TYPE IF EXISTS vegtype CASCADE;
DROP TYPE IF EXISTS course CASCADE;
CREATE TYPE roles AS ENUM ('CUSTOMER', 'RESTAURANT', 'DELIVERY');
CREATE TYPE doses AS ENUM ('0', '1', '2');
CREATE TYPE rating AS ENUM ('0', '1', '2', '3', '4', '5');
CREATE TYPE vegtype AS  ENUM ('VEG', 'NON_VEG');
CREATE TYPE course AS ENUM ('BREAKFAST', 'STARTERS', 'MAIN_COURSE', 'DESSERT', 'SNACKS', 'DINNER');

-- Generalization for Django --
DROP TABLE IF EXISTS gen_user CASCADE;

CREATE TABLE gen_user (
    user_id bigserial,
    username varchar(30),
    password varchar(128),
    role roles,
    valid boolean default true,
    primary key(user_id)
);

-- Customer table --
DROP TABLE IF EXISTS customer CASCADE;

CREATE TABLE customer (
    customer_id bigserial,
    mobile_no integer,
    email varchar(254),
    subscription boolean,
    primary key(customer_id),
    foreign key(customer_id) references gen_user on delete cascade
);


-- Latitude Longitude Table --
DROP TABLE IF EXISTS coordinates CASCADE;

CREATE TABLE coordinates (
    gen_address TEXT,
    latitude float,
    longitude float,
    primary key(latitude, longitude)
);

-- Restaurant Table --
DROP TABLE IF EXISTS restaurant CASCADE;

CREATE TABLE restaurant (
    restaurant_id bigserial,
    restaurant_name varchar(256),
    mobile_no integer,
    email varchar(254),
    overall_discount float,
    max_safety_follow boolean,
    open_time time with time zone,
    close_time time with time zone,
    avg_cost_for_two integer,
    latitude float,
    longitude float,
    primary key(restaurant_id),
    foreign key(restaurant_id) references gen_user on delete cascade,
    foreign key(latitude, longitude) references coordinates (latitude, longitude) on delete no action
);


-- Address Table --
DROP TABLE IF EXISTS customer_address CASCADE;

CREATE TABLE customer_address (
    customer_id bigserial,
    latitude float,
    longitude float,
    primary key(customer_id, latitude, longitude),
    foreign key(customer_id) references customer on delete cascade,
    foreign key(latitude, longitude) references coordinates (latitude, longitude) on delete no action
);

-- Delivery Table -- 
DROP TABLE IF EXISTS delivery CASCADE;

CREATE TABLE delivery (
    delivery_id bigserial,
    mobile_no integer,
    email varchar(254),
    available BOOLEAN,
    vaccination_status roles,
    primary key(delivery_id),
    foreign key(delivery_id) references gen_user on delete cascade
);

-- ORDER TABLE --
DROP TABLE IF EXISTS food_order;

CREATE TABLE food_order (
    order_id integer,
    customer_id bigserial,
    order_place_time timestamp with time zone,
    expected_delivery_time timestamp with time zone,
    actual_delivery_time timestamp with time zone,
    restaurant_review TEXT,
    restaurant_rating rating,
    foreign key(customer_id) references customer on delete cascade,
    primary key(order_id, customer_id)
);

-- FAVORITES TABLE --
DROP TABLE IF EXISTS favorites;

CREATE TABLE favorites (
    customer_id bigserial,
    restaurant_id bigserial,
    primary key(customer_id, restaurant_id),
    foreign key(customer_id) references customer on delete cascade,
    foreign key(restaurant_id) references restaurant on delete cascade
);

-- FOOD TYPES TABLE --
DROP TABLE IF EXISTS food_type;

create table food_type (
    food_name varchar(256),
    food_type vegtype,
    course_type course,
    primary key(food_name)
);

-- FOOD ITEMS TABLE --
DROP TABLE IF EXISTS food_items;

create table food_items (
    restaurant_id bigserial,
    food_name varchar(256),
    available boolean,
    preparation_time smallint,
    specific_discount float,
    cost float,
    primary key(restaurant_id, food_name),
    foreign key(restaurant_id) references restaurant on delete no action,
    foreign key(food_name) references food_type on update cascade
);
-- We kept this as "on delete no action" because when we food_order a food item which was delivered
-- successfully, and then the restaurant is removed, we'd still need to know the cost of the 
-- last ordered food item


-- ORDERED RESTAURANT TABLE --
DROP TABLE IF EXISTS order_restaurant;

CREATE TABLE order_restaurant (
    order_id integer,
    customer_id bigserial,
    restaurant_id bigserial,
    primary key(order_id, customer_id, restaurant_id),
    foreign key(order_id, customer_id) references food_order on delete no action,
    foreign key(restaurant_id) references restaurant on delete no action
);
-- We have set no action for delete since it requires when restaurant is closed,
-- the customer will still want to see food_order history

-- ORDER HAS TABLE --
DROP TABLE IF EXISTS order_has;

create table order_has(
    order_id integer,
    customer_id bigserial,
    food_name varchar(256),
    quantity integer,
    food_review text,
    food_rating rating,
    primary key(order_id, customer_id, food_name),
    foreign key(order_id, customer_id) references food_order on delete no action
);
-- On a similar basis to the last, when the customer deletes his account
-- The restaurant still wants to view their reviews

-- ORDER TAKEN TABLE --
DROP TABLE IF EXISTS order_taken;

create table order_taken(
    order_id integer,
    customer_id bigserial,
    delivery_id bigserial,
    delivery_review text,
    delivery_rating rating,
    primary key(order_id, customer_id, delivery_id),
    foreign key(order_id, customer_id) references food_order on delete no action,
    foreign key(delivery_id) references delivery on delete no action
);
-- Once again equivalent to the previous scenarios

-- CREATE OR REPLACE FUNCTION clean_order_taken() 
--   RETURNS trigger AS                                                                           
-- $$
-- BEGIN
--     DELETE FROM order_taken 
--     WHERE 
--         order_id IS NULL 
--     AND 
--         customer_id IS NULL 
--     AND 
--         delivery_id IS NULL;
--     return NULL;
-- END;
-- $$
-- LANGUAGE plpgsql VOLATILE;

-- CREATE OR REPLACE TRIGGER trigger_order_taken
--     AFTER UPDATE ON order_taken 
-- FOR EACH STATEMENT --<< fire only once for each statement, not row
-- EXECUTE PROCEDURE clean_order_taken();