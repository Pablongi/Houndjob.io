import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from transformers import pipeline
import spacy
import re
from datasets import load_dataset
from google.cloud import aiplatform  # Vertex AI

# Preload global (para no recargar cada run)
nlp = spacy.load("es_core_news_sm")
model = SentenceTransformer('distiluse-base-multilingual-cased-v1')
classifier = pipeline('zero-shot-classification', model='facebook/bart-large-mnli')

# Init Vertex AI (si usas GCP – opcional para offload)
aiplatform.init(project='houndjob', location='southamerica-west1')

def load_data(file='jobs_data.csv'):
    return pd.read_csv(file)

def basic_homologate(df=None):
    if df is None:
        df = load_data()
    embeddings = model.encode(df['text'].tolist(), batch_size=32)  # Batch para rapidez
    kmeans = KMeans(n_clusters=20, random_state=42)  # Reducir clusters
    df['cluster'] = kmeans.fit_predict(embeddings)
    cluster_labels = df.groupby('cluster')['title'].apply(lambda x: x.mode()[0] if not x.empty else "Unknown")
    df['homologated_title'] = df['cluster'].map(cluster_labels)
    df.to_csv('homologated_jobs_basic.csv', index=False)
    print("Clustering done.")

def advanced_homologate(df=None, labeled_file='ml/labeled_jobs.csv'):
    if df is None:
        df = load_data()
    dataset = load_dataset('csv', data_files=labeled_file)
    candidate_labels = list(set(pd.read_csv(labeled_file)['category'].dropna()))
    
    # Batch classification con Vertex si disponible, else local
    try:
        vertex_model = aiplatform.Endpoint.list(filter='display_name="bart-large-mnli"')[0] if aiplatform.Endpoint.list() else None
        if vertex_model:
            # Offload a Vertex AI (rápido con GPU)
            predictions = vertex_model.predict(instances=[{"text": text, "candidate_labels": candidate_labels} for text in df['text']])
            df['category'] = [pred.output[0] for pred in predictions]
        else:
            # Local batch
            results = classifier(df['text'].tolist(), candidate_labels, batch_size=16)  # Batch
            df['category'] = [r['labels'][0] for r in results]
    except:
        # Fallback local
        for idx, row in df.iterrows():
            result = classifier(row['text'], candidate_labels)
            df.at[idx, 'category'] = result['labels'][0]

    # Parallel spacy con batch
    docs = list(nlp.pipe(df['description']))
    for idx, doc in enumerate(docs):
        salary = next((ent.text for ent in doc.ents if ent.label_ == "MONEY"), "No especificado")
        experience = re.search(r'(\d+[\s-]*años?|junior|senior|sin experiencia)', df.at[idx, 'description'], re.I)
        df.at[idx, 'homologated_salary'] = salary
        df.at[idx, 'homologated_experience'] = experience.group(0) if experience else "No especificado"
    
    df.to_csv('homologated_jobs_advanced.csv', index=False)
    print("Advanced homologation done.")

if __name__ == "__main__":
    df = load_data()
    advanced_homologate(df)