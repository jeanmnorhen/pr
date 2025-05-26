
from http.server import BaseHTTPRequestHandler
import json
import random
import re

class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        # Roteamento simples baseado no caminho
        if self.path == '/api/products' or self.path.startswith('/api/products?'):
            products = []
            product_names = ["Laptop Gamer", "Smartphone Pro", "Fone Bluetooth", "Smartwatch X", "Tablet 10", "Câmera 4K", "Console NextGen", "Mouse Ergonômico", "Teclado Mecânico", "Monitor Ultrawide"]
            descriptions = [
                "Desempenho incrível para jogos e trabalho.",
                "Câmera de alta resolução e bateria duradoura.",
                "Som imersivo e cancelamento de ruído.",
                "Monitore sua saúde e notificações.",
                "Ideal para leitura, vídeos e navegação.",
                "Capture seus melhores momentos com qualidade profissional.",
                "Gráficos de última geração e jogos exclusivos.",
                "Conforto para longas horas de uso.",
                "Resposta tátil e iluminação RGB.",
                "Experiência visual ampla e imersiva."
            ]
            image_keywords = {
                "Laptop Gamer": "laptop gaming",
                "Smartphone Pro": "smartphone modern",
                "Fone Bluetooth": "bluetooth headphones",
                "Smartwatch X": "smartwatch sleek",
                "Tablet 10": "tablet device",
                "Câmera 4K": "4k camera",
                "Console NextGen": "gaming console",
                "Mouse Ergonômico": "ergonomic mouse",
                "Teclado Mecânico": "mechanical keyboard",
                "Monitor Ultrawide": "ultrawide monitor"
            }


            for i in range(10):
                chosen_product_name_base = random.choice(product_names)
                variant_number = random.randint(1, 100)
                product_name_full = f"{chosen_product_name_base} #{variant_number}"
                
                # Gerar nome para URL do placeholder e data-ai-hint
                placeholder_text = chosen_product_name_base.replace(' ', '+')
                ai_hint_keywords = image_keywords.get(chosen_product_name_base, "product item")

                products.append({
                    "id": str(i + 1),
                    "name": product_name_full,
                    "price": round(random.uniform(50.0, 3500.0), 2),
                    "description": random.choice(descriptions),
                    "imageUrl": f"https://placehold.co/400x300.png?text={placeholder_text}",
                    "data-ai-hint": ai_hint_keywords
                })

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            # CORS é geralmente tratado pela Vercel em produção, mas útil para vercel dev
            self.send_header('Access-Control-Allow-Origin', '*') 
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            self.wfile.write(json.dumps(products).encode('utf-8'))
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Not Found", "path": self.path}).encode('utf-8'))
        return

    def do_OPTIONS(self):
        self.send_response(204) # No Content
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS') # Métodos permitidos
        self.send_header('Access-Control-Allow-Headers', 'Content-Type') # Headers permitidos
        self.send_header('Access-Control-Max-Age', '86400') # Cache da preflight request por 1 dia
        self.end_headers()
        return

    