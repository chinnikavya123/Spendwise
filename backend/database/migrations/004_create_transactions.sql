
USE spendwise;

CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NULL,

    category_name VARCHAR(100) NOT NULL,

    type ENUM('income', 'expense') NOT NULL,

    amount DECIMAL(12, 2) NOT NULL,

    description VARCHAR(255) DEFAULT NULL,

    transaction_date DATE NOT NULL,

    payment_method VARCHAR(50) DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_transaction_amount
        CHECK (amount > 0),

    INDEX idx_transactions_user (user_id),

    INDEX idx_transactions_date (transaction_date),

    INDEX idx_transactions_type (type),

    INDEX idx_transactions_category (category_id)
);
