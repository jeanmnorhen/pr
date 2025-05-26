
from http.server import BaseHTTPRequestHandler
import json
import random
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        parsed_path = urlparse(self.path)
        query_params = parse_qs(parsed_path.query)
        
        search_term = query_params.get('search', [None])[0]
        category_filter = query_params.get('category', [None])[0]

        products_base = []
        product_names_bases = ["Laptop Gamer", "Smartphone Pro", "Fone Bluetooth", "Smartwatch X", "Tablet 10", "Câmera 4K", "Console NextGen", "Mouse Ergonômico", "Teclado Mecânico", "Monitor Ultrawide"]
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
        
        store_owners_data = [
            {"id": "store_001", "name": "TecnoLoja"},
            {"id": "store_002", "name": "Gadgets Incríveis"},
            {"id": "store_003", "name": "Info Mania"},
            {"id": "store_004", "name": "Eletro&Cia"},
            {"id": "store_005", "name": "Digital World"}
        ]

        ad_types = [None, "offer", "promotion"] # None for standard listing

        for i in range(20): # Gerar uma base maior para melhor filtragem
            chosen_product_name_base = random.choice(product_names_bases)
            variant_number = random.randint(1, 100)
            product_name_full = f"{chosen_product_name_base} #{variant_number}"
            
            ai_hint_keywords = image_keywords.get(chosen_product_name_base, "product item")
            store_owner = random.choice(store_owners_data)
            ad_type = random.choice(ad_types)

            products_base.append({
                "id": str(i + 1),
                "name": product_name_full,
                "price": round(random.uniform(50.0, 3500.0), 2),
                "description": random.choice(descriptions),
                "category": chosen_product_name_base,
                "imageUrl": f"https://placehold.co/600x400.png?a={random.randint(1,1000)}",
                "data-ai-hint": ai_hint_keywords,
                "storeOwnerId": store_owner["id"],
                "storeOwnerName": store_owner["name"],
                "adType": ad_type
            })

        filtered_products = products_base
        if category_filter:
            filtered_products = [p for p in filtered_products if p['category'].lower() == category_filter.lower()]
        
        if search_term:
            search_lower = search_term.lower()
            filtered_products = [
                p for p in filtered_products if 
                search_lower in p['name'].lower() or 
                search_lower in p['description'].lower() or
                search_lower in p['storeOwnerName'].lower()
            ]
        
        # Simulate ad priority: promotions first, then offers, then standard
        def sort_key(product):
            if product.get("adType") == "promotion":
                return 0
            if product.get("adType") == "offer":
                return 1
            return 2
            
        filtered_products.sort(key=sort_key)
        
        final_products = filtered_products[:10]

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*') 
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(final_products).encode('utf-8'))
        return

    def do_OPTIONS(self):
        self.send_response(204) 
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Max-Age', '86400') 
        self.end_headers()
        return

    