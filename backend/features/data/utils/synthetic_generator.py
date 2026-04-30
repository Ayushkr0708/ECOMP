import os
import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def generate_synthetic_customers(num_customers: int = 1000) -> pd.DataFrame:
    np.random.seed(42)
    random.seed(42)
    
    customer_ids = [f"CUST_{i:05d}" for i in range(1, num_customers + 1)]
    ages = np.random.normal(35, 12, num_customers).astype(int)
    ages = np.clip(ages, 18, 75)
    
    base_incomes = np.random.lognormal(10.5, 0.5, num_customers)
    annual_incomes = np.clip(base_incomes, 15000, 200000).astype(int)
    
    spending_scores = np.random.normal(50, 20, num_customers).astype(int)
    spending_scores = np.clip(spending_scores, 1, 100)
    
    purchase_frequencies = np.random.exponential(5, num_customers).astype(int)
    purchase_frequencies = np.clip(purchase_frequencies, 1, 50)
    
    avg_order_values = np.random.lognormal(4.5, 0.7, num_customers).astype(int)
    avg_order_values = np.clip(avg_order_values, 10, 2000)
    
    last_purchase_days = np.random.exponential(30, num_customers).astype(int)
    last_purchase_days = np.clip(last_purchase_days, 1, 365)
    
    categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys']
    preferred_categories = [random.choice(categories) for _ in range(num_customers)]
    
    engagement_levels = np.random.choice(['Low', 'Medium', 'High'], num_customers, p=[0.3, 0.4, 0.3])
    
    df = pd.DataFrame({
        'customer_id': customer_ids,
        'age': ages,
        'annual_income': annual_incomes,
        'spending_score': spending_scores,
        'purchase_frequency': purchase_frequencies,
        'avg_order_value': avg_order_values,
        'last_purchase_days': last_purchase_days,
        'preferred_category': preferred_categories,
        'engagement_level': engagement_levels
    })
    
    return df

def save_synthetic_data(df: pd.DataFrame, output_dir: str, filename: str = "synthetic_customers.csv") -> str:
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, filename)
    df.to_csv(filepath, index=False)
    return filepath