
from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

# A URL do seu app Next.js/Vercel onde o fluxo Genkit está hospedado.
# Idealmente, configure isso como uma variável de ambiente na Vercel.
NEXT_APP_URL = os.environ.get("NEXT_PUBLIC_APP_URL", "http://localhost:9002") # Fallback para localhost para dev local com `vercel dev`

@app.route('/', defaults={'path': ''}, methods=['POST'])
@app.route('/<path:path>', methods=['POST'])
def classify_product_handler(path):
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    product_name = data.get('productName')
    product_description = data.get('productDescription')

    if not product_name or not product_description:
        return jsonify({"error": "Missing productName or productDescription"}), 400

    genkit_flow_url = f"{NEXT_APP_URL}/api/ai/product-classification-flow"

    try:
        response = requests.post(genkit_flow_url, json={
            "productName": product_name,
            "productDescription": product_description
        })
        response.raise_for_status()  # Lança um erro para códigos HTTP 4xx/5xx
        
        # Retorna a resposta do fluxo Genkit diretamente
        return jsonify(response.json()), response.status_code

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred calling Genkit flow: {http_err} - {response.text}")
        return jsonify({"error": "Failed to call classification flow", "details": response.text}), response.status_code
    except requests.exceptions.RequestException as req_err:
        print(f"Request error occurred calling Genkit flow: {req_err}")
        return jsonify({"error": "Failed to connect to classification flow", "details": str(req_err)}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

# Este bloco é para teste local e não será usado pela Vercel diretamente.
# Para testar localmente com `python api/classify_product_cf.py`:
# if __name__ == '__main__':
#     # Defina a variável de ambiente para teste local se necessário
#     # os.environ["NEXT_PUBLIC_APP_URL"] = "http://localhost:9002" 
#     app.run(debug=True, port=5003)
#     # Exemplo de chamada:
#     # curl -X POST -H "Content-Type: application/json" -d '{"productName": "Cadeira Gamer Pro", "productDescription": "Cadeira ergonômica com suporte lombar e descanso de braço ajustável, ideal para longas sessões de jogo."}' http://localhost:5003/
