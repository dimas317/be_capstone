create table users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(255) NOT NULL,
	phone_number VARCHAR(255) not null,
	email VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,
	fullname VARCHAR(255) NOT NULL,
	balance NUMERIC(12, 2) DEFAULT 0 NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table transactions (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
	category VARCHAR(50) NOT NULL,
	amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
	payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'non-cash')),
	transaction_date DATE NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

CREATE TRIGGER trg_update_badge_on_level_change
AFTER UPDATE OF level ON users
FOR EACH ROW
EXECUTE FUNCTION update_badge();

CREATE OR REPLACE FUNCTION update_badge()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika level tidak berubah, jangan lakukan apa-apa
    IF NEW.level = OLD.level THEN
        RETURN NEW;
    END IF;

    -- Hapus badge lama user (opsional, jika kamu hanya ingin 1 badge per user)
    DELETE FROM badges
    WHERE user_id = NEW.id;

    -- Tambah badge baru sesuai level
    INSERT INTO badges (user_id, name, description, awarded_at)
    VALUES (
        NEW.id,
        'Level ' || NEW.level || ' Badge',
        'Badge untuk level ' || NEW.level,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_user_level_based_on_age()
RETURNS TRIGGER AS $$
DECLARE
    account_age INT;
    new_level INT;
BEGIN
    -- Hitung umur akun user berdasarkan created_at user
    SELECT DATE_PART('day', NOW() - u.created_at)
    INTO account_age
    FROM users u
    WHERE u.id = NEW.user_id;

    -- Tentukan level berdasarkan umur akun
    IF account_age BETWEEN 1 AND 30 THEN
        new_level := 1;
    ELSIF account_age BETWEEN 31 AND 60 THEN
        new_level := 2;
    ELSIF account_age BETWEEN 61 AND 90 THEN
        new_level := 3;
    ELSIF account_age BETWEEN 91 AND 120 THEN
        new_level := 4;
    ELSE
        new_level := 5;
    END IF;

    -- Update level
    UPDATE users
    SET level = new_level
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_badges_user_id ON badges(user_id);

ALTER TABLE users
ADD COLUMN level INT DEFAULT 1;

ALTER TABLE users
add column domisili text;

alter table users 
add column status_mahasiswa varchar (50)check (status_mahasiswa in ('Aktif', 'Non-Aktif'));

alter table users 
add column jenis_kelamin varchar (50) check (jenis_kelamin in ('Laki-laki', 'Perempuan'));

alter table transactions
add column name varchar(255) not null;

ALTER TABLE transactions
ADD COLUMN category_id INT REFERENCES categories(id);

ALTER TABLE transactions
ADD CONSTRAINT expense_must_have_category
CHECK (
    (type = 'income' AND category_id IS NULL) OR
    (type = 'expense' AND category_id IS NOT NULL)
);

SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column
FROM 
    information_schema.table_constraints AS tc
JOIN 
    information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
JOIN 
    information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'transactions';

  SELECT 
    t.id,
    t.type,
    t.amount,
    t.payment_method,
    t.transaction_date,
    t.category_id,
    c.name AS category_name
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
ORDER BY t.id;

SELECT
    tc.constraint_name,
    kcu.column_name,
    tc.table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'transactions';