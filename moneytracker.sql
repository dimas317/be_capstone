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

create table badges (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	name VARCHAR(255) NOT NULL,
	description TEXT,
	awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

CREATE OR REPLACE FUNCTION update_user_level_based_on_age()
RETURNS TRIGGER AS $$
DECLARE
    account_age INT;
    new_level INT;
BEGIN
    -- Hitung umur akun user berdasarkan created_at
    SELECT COALESCE(FLOOR(EXTRACT(EPOCH FROM (NOW() - u.created_at)) / 86400), 0)
    INTO account_age
    FROM users u
    WHERE u.id = NEW.user_id;

    -- Tentukan level berdasarkan umur akun
    IF account_age BETWEEN 0 AND 30 THEN
        new_level := 1;  -- Beginner
    ELSIF account_age BETWEEN 31 AND 60 THEN
        new_level := 2;  -- Bronze
    ELSIF account_age BETWEEN 61 AND 90 THEN
        new_level := 3;  -- Silver
    ELSIF account_age BETWEEN 91 AND 120 THEN
        new_level := 4;  -- Gold
    ELSE
        new_level := 5;  -- Platinum
    END IF;

    -- Update level user
    UPDATE users
    SET level = new_level
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_badge()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Jika fungsi dipanggil saat INSERT (OLD tidak ada)
    IF TG_OP = 'INSERT' THEN
        INSERT INTO badges (user_id, name, description, awarded_at)
        VALUES (
            NEW.id,
            'Level ' || NEW.level || ' Badge',
            'Badge untuk level ' || NEW.level,
            NOW()
        );
        RETURN NEW;
    END IF;

    -- Jika dipanggil saat UPDATE level
    IF TG_OP = 'UPDATE' THEN
        
        IF NEW.level = OLD.level THEN
            RETURN NEW; -- tidak berubah, tidak perlu buat badge
        END IF;

        -- Hapus badge lama
        DELETE FROM badges WHERE user_id = NEW.id;

        -- Buat badge baru
        INSERT INTO badges (user_id, name, description, awarded_at)
        VALUES (
            NEW.id,
            'Level ' || NEW.level || ' Badge',
            'Badge untuk level ' || NEW.level,
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$;

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

CREATE TRIGGER trg_update_user_level_on_transaction
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_user_level_based_on_age();

CREATE TRIGGER trg_insert_badge_on_user_register
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION update_badge();

CREATE TRIGGER trg_update_badge_after_level_change
AFTER UPDATE OF level ON users
FOR EACH ROW
EXECUTE FUNCTION update_badge();

CREATE TRIGGER trg_update_badge_on_level_change
AFTER UPDATE OF level ON users
FOR EACH ROW
EXECUTE FUNCTION update_badge();

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

ALTER TABLE badges 
  ALTER COLUMN awarded_at TYPE timestamptz USING awarded_at AT TIME ZONE 'UTC';

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
