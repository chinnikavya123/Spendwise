
USE spendwise;

INSERT INTO categories (user_id, name, type, icon, color, is_default)
SELECT NULL, defaults.name, defaults.type, defaults.icon, defaults.color, TRUE
FROM (
    SELECT 'Salary' AS name, 'income' AS type, 'wallet' AS icon, '#22C55E' AS color
    UNION ALL SELECT 'Freelance', 'income', 'laptop', '#10B981'
    UNION ALL SELECT 'Investments', 'income', 'trending-up', '#14B8A6'
    UNION ALL SELECT 'Business', 'income', 'briefcase', '#0EA5E9'
    UNION ALL SELECT 'Other Income', 'income', 'plus-circle', '#6366F1'
    UNION ALL SELECT 'Food', 'expense', 'utensils', '#F97316'
    UNION ALL SELECT 'Shopping', 'expense', 'shopping-bag', '#EC4899'
    UNION ALL SELECT 'Transport', 'expense', 'car', '#3B82F6'
    UNION ALL SELECT 'Bills', 'expense', 'receipt', '#EAB308'
    UNION ALL SELECT 'Entertainment', 'expense', 'film', '#A855F7'
    UNION ALL SELECT 'Healthcare', 'expense', 'heart-pulse', '#EF4444'
    UNION ALL SELECT 'Education', 'expense', 'graduation-cap', '#8B5CF6'
    UNION ALL SELECT 'Other Expense', 'expense', 'circle-ellipsis', '#64748B'
) AS defaults
WHERE NOT EXISTS (
    SELECT 1
    FROM categories existing
    WHERE existing.user_id IS NULL
      AND existing.name = defaults.name
      AND existing.type = defaults.type
);
