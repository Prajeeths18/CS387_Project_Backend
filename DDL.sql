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
CREATE TYPE course AS ENUM ('STARTERS', 'MAIN_COURSE', 'DESSERT', 'SNACKS');

-- Generalization for Django --
DROP TABLE IF EXISTS gen_user CASCADE;

CREATE TABLE gen_user (
    user_id bigserial NOT NULL,
    username varchar(30) NOT NULL UNIQUE,
    password varchar(128) NOT NULL,
    role roles NOT NULL,
    valid boolean default true NOT NULL,
    primary key(user_id)
);

-- Customer table --
DROP TABLE IF EXISTS customer CASCADE;

CREATE TABLE customer (
    customer_id bigint NOT NULL,
    mobile_no bigint NOT NULL,
    email varchar(254), --customer email can be null, this means they did not provide an email--
    subscription boolean default false NOT NULL,
    primary key(customer_id),
    foreign key(customer_id) references gen_user on delete cascade
);


-- Latitude Longitude Table --
DROP TABLE IF EXISTS coordinates CASCADE;

CREATE TABLE coordinates (
    gen_address TEXT NOT NULL,
    latitude float NOT NULL,
    longitude float NOT NULL,
    primary key(latitude, longitude)
);

-- Restaurant Table --
DROP TABLE IF EXISTS restaurant CASCADE;

CREATE TABLE restaurant (
    restaurant_id bigint NOT NULL,
    restaurant_name varchar(256) NOT NULL,
    mobile_no bigint NOT NULL,
    email varchar(254) default NULL, --restaurant email can be null, this means they did not provide an email--
    overall_discount float default 0 NOT NULL,
    max_safety_follow boolean default false NOT NULL,
    open_time time with time zone default '10:00+5:30' NOT NULL,
    close_time time with time zone default '21:00+5:30' NOT NULL,
    avg_cost_for_two integer default 0 NOT NULL,
    latitude float NOT NULL,
    longitude float NOT NULL,
    primary key(restaurant_id),
    foreign key(restaurant_id) references gen_user on delete cascade,
    foreign key(latitude, longitude) references coordinates (latitude, longitude) on delete no action
);


-- Address Table --
DROP TABLE IF EXISTS customer_address CASCADE;

CREATE TABLE customer_address (
    customer_id bigint NOT NULL,
    latitude float NOT NULL,
    longitude float NOT NULL,
    primary key(customer_id, latitude, longitude),
    foreign key(customer_id) references customer on delete cascade,
    foreign key(latitude, longitude) references coordinates (latitude, longitude) on delete no action
);

-- Delivery Table -- 
DROP TABLE IF EXISTS delivery CASCADE;

CREATE TABLE delivery (
    delivery_id bigint NOT NULL,
    mobile_no bigint NOT NULL,
    email varchar(254), --delivery email can be null, this means the delivery partner did not provide an email--
    available BOOLEAN default false NOT NULL,
    vaccination_status doses NOT NULL,
    primary key(delivery_id),
    foreign key(delivery_id) references gen_user on delete cascade
);

-- ORDER TABLE --
DROP TABLE IF EXISTS food_order CASCADE;

CREATE TABLE food_order (
    order_id integer NOT NULL,
    customer_id bigint NOT NULL,
    order_place_time timestamp with time zone NOT NULL,
    expected_delivery_time timestamp with time zone, -- null means order was rejected
    actual_delivery_time timestamp with time zone, -- null means yet to deliver
    latitude float NOT NULL,
    longitude float NOT NULL,
    foreign key(customer_id) references customer on delete cascade,
    foreign key(latitude, longitude) references coordinates (latitude, longitude) on delete no action,
    primary key(order_id, customer_id)
);

-- FAVORITES TABLE --
DROP TABLE IF EXISTS favorites CASCADE;

CREATE TABLE favorites (
    customer_id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    primary key(customer_id, restaurant_id),
    foreign key(customer_id) references customer on delete cascade,
    foreign key(restaurant_id) references restaurant on delete cascade
);

-- FOOD TYPES TABLE --
DROP TABLE IF EXISTS food_type CASCADE;

create table food_type (
    food_name varchar(256) NOT NULL,
    food_type vegtype NOT NULL,
    course_type course NOT NULL,
    primary key(food_name)
);

-- FOOD ITEMS TABLE --
DROP TABLE IF EXISTS food_items CASCADE;

create table food_items (
    restaurant_id bigint NOT NULL,
    food_name varchar(256) NOT NULL,
    available boolean NOT NULL,
    preparation_time smallint NOT NULL,
    specific_discount float NOT NULL,
    cost float NOT NULL,
    primary key(restaurant_id, food_name),
    foreign key(restaurant_id) references restaurant on delete no action,
    foreign key(food_name) references food_type on update cascade
);
-- We kept this as "on delete no action" because when we food_order a food item which was delivered
-- successfully, and then the restaurant is removed, we'd still need to know the cost of the 
-- last ordered food item


-- ORDERED RESTAURANT TABLE --
DROP TABLE IF EXISTS order_restaurant CASCADE;

CREATE TABLE order_restaurant (
    order_id integer NOT NULL,
    customer_id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    restaurant_review TEXT, --restaurant review can be null, it means that the customer associated with the order did not write a review for the restaurant--
    restaurant_rating rating, --restaurant rating can be null, it means that the customer associated with the order did not submit a rating for the restaurant--
    primary key(order_id, customer_id),
    foreign key(order_id, customer_id) references food_order on delete no action,
    foreign key(restaurant_id) references restaurant on delete no action
);
-- We have set no action for delete since it requires when restaurant is closed,
-- the customer will still want to see food_order history

-- ORDER HAS TABLE --
DROP TABLE IF EXISTS order_has CASCADE;

create table order_has(
    order_id integer NOT NULL,
    customer_id bigint NOT NULL,
    food_name varchar(256) NOT NULL,
    quantity integer NOT NULL,
    food_review text, --food review can be null, it means that the customer associated with the order did not write a review for the food item--
    food_rating rating, --food rating can be null, it means that the customer associated with the order did not submit a rating for the food item--
    primary key(order_id, customer_id, food_name),
    foreign key(order_id, customer_id) references food_order on delete no action
);
-- On a similar basis to the last, when the customer deletes his account
-- The restaurant still wants to view their reviews

-- ORDER TAKEN TABLE --
DROP TABLE IF EXISTS order_taken CASCADE;

create table order_taken(
    order_id integer NOT NULL,
    customer_id bigint NOT NULL,
    delivery_id bigint DEFAULT NULL,
    delivery_review text, --delivary review can be null, it means that the customer associated with the order did not write a review for the delivery--
    delivery_rating rating, --delivery rating can be null, it means that the customer associated with the order did not submit a rating for the delivery--
    primary key(order_id, customer_id),
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
