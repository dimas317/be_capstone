CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    level INTEGER default 1,
    image VARCHAR(255),
    domisili TEXT,
    status_mahasiswa varchar (50)check (status_mahasiswa in ('Aktif', 'Non-Aktif')),
    jenis_kelamin varchar (50) check (jenis_kelamin in ('Laki-laki', 'Perempuan'))
);

create table transactions (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
	category_id INT REFERENCES categories(id),
	amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
	payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'non-cash')),
	transaction_date DATE NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	name varchar(255) not null
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE CHECK (name IN (
        'makanan & minuman',
        'transportasi',
        'hiburan',
        'lainnya'
    ))
);

CREATE OR REPLACE FUNCTION update_user_balance(userId INT)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET balance = COALESCE((
        SELECT SUM(
            CASE 
                WHEN type = 'income' THEN amount 
                WHEN type = 'expense' THEN -amount 
            END
        )
        FROM transactions
        WHERE user_id = userId
    ), 0)
    WHERE id = userId;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Untuk INSERT atau UPDATE
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        PERFORM update_user_balance(NEW.user_id);
        RETURN NEW;
    END IF;

    -- Untuk DELETE
    IF (TG_OP = 'DELETE') THEN
        PERFORM update_user_balance(OLD.user_id);
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_insert_transaction
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_update_user_balance();

CREATE TRIGGER trg_update_transaction
AFTER UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_update_user_balance();

CREATE TRIGGER trg_delete_transaction
AFTER DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_update_user_balance();

SELECT 
    event_object_table AS table_name,
    trigger_name,
    event_manipulation AS event,
    action_timing AS timing,
    action_statement
FROM information_schema.triggers
ORDER BY table_name, trigger_name;

SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

SELECT 
    proname AS trigger_function
FROM pg_proc
JOIN pg_language ON pg_proc.prolang = pg_language.oid
WHERE pg_language.lanname = 'plpgsql'
AND pg_get_function_result(pg_proc.oid) = 'trigger';

SET TIMEZONE = 'Asia/Jakarta';

ALTER DATABASE neondb SET timezone TO 'Asia/Jakarta';

ALTER TABLE users
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

ALTER TABLE transactions 
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

INSERT INTO categories (name)
VALUES
('makanan & minuman'),
('transportasi'),
('hiburan'),
('lainnya');


drop table users;
