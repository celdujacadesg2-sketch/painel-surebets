# Exemplo de integração com Telegram Bot para enviar sinais

import requests
import os

API_URL = "http://localhost:3000/api/signals/create"
API_SECRET = os.getenv("API_SECRET", "sua-chave-api-secreta-para-enviar-sinais")

def enviar_sinal(sport, event, market, roi, odds, bookmakers):
    """
    Envia um sinal de surebet para o sistema
    
    Args:
        sport (str): Nome do esporte (ex: "Futebol", "Basquete")
        event (str): Nome do evento (ex: "Flamengo vs Palmeiras")
        market (str): Tipo de mercado (ex: "1x2", "Over/Under")
        roi (float): ROI em percentual (ex: 5.5)
        odds (list): Lista de odds [{selection: "...", value: "..."}]
        bookmakers (list): Lista de casas [{name: "...", url: "..."}]
    """
    
    payload = {
        "sport": sport,
        "event": event,
        "market": market,
        "roi": roi,
        "odds": odds,
        "bookmakers": bookmakers
    }
    
    headers = {
        "x-api-secret": API_SECRET,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(API_URL, json=payload, headers=headers)
        response.raise_for_status()
        print(f"✅ Sinal enviado com sucesso: {response.json()}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao enviar sinal: {e}")
        return False


# Exemplo de uso
if __name__ == "__main__":
    enviar_sinal(
        sport="Futebol",
        event="Flamengo vs Palmeiras",
        market="1x2",
        roi=5.5,
        odds=[
            {"selection": "Flamengo", "value": "2.10"},
            {"selection": "Empate", "value": "3.40"},
            {"selection": "Palmeiras", "value": "2.80"}
        ],
        bookmakers=[
            {"name": "Bet365", "url": "https://bet365.com"},
            {"name": "Betano", "url": "https://betano.com"},
            {"name": "Betfair", "url": "https://betfair.com"}
        ]
    )
