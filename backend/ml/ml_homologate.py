import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from transformers import pipeline
import spacy
import re
from datasets import load_dataset

nlp = spacy.load("es_core_news_sm")

def load_data(file='jobs_data.csv'):
    return pd.read_csv(file)

def basic_homologate():
    df = load_data()
    model = SentenceTransformer('distiluse-base-multilingual-cased-v1')
    embeddings = model.encode(df['text'].tolist())
    kmeans = KMeans(n_clusters=50, random_state=42)
    df['cluster'] = kmeans.fit_predict(embeddings)
    cluster_labels = df.groupby('cluster')['title'].apply(lambda x: x.mode()[0] if not x.empty else "Unknown")
    df['homologated_title'] = df['cluster'].map(cluster_labels)
    df.to_csv('homologated_jobs_basic.csv', index=False)
    print("Clustering done. Results in homologated_jobs_basic.csv")

def advanced_homologate(labeled_file='ml/labeled_jobs.csv'):
    dataset = load_dataset('csv', data_files=labeled_file)
    classifier = pipeline('zero-shot-classification', model='facebook/bart-large-mnli')
    df = pd.read_csv('jobs_data.csv')
    candidate_labels = list(set(pd.read_csv(labeled_file)['category'].dropna()))
    for idx, row in df.iterrows():
        result = classifier(row['text'], candidate_labels)
        df.at[idx, 'category'] = result['labels'][0]
        doc = nlp(row['description'])
        salary = next((ent.text for ent in doc.ents if ent.label_ == "MONEY"), "No especificado")
        experience = re.search(r'(\d+[\s-]*años?|junior|senior|sin experiencia)', row['description'], re.I)
        df.at[idx, 'homologated_salary'] = salary
        df.at[idx, 'homologated_experience'] = experience.group(0) if experience else "No especificado"
    df.to_csv('homologated_jobs_advanced.csv', index=False)
    print("Advanced homologation done.")

if __name__ == "__main__":
    # basic_homologate()  # Opcional
    advanced_homologate()