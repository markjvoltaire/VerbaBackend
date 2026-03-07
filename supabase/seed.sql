-- Verba V1 Seed Data - Spanish phrases
-- Run after schema.sql

INSERT INTO phrases (target_lang, phrase, translation, scenario) VALUES
-- Restaurant
('es', 'Hola', 'Hello', 'restaurant'),
('es', 'Quiero pedir una pizza', 'I want to order a pizza', 'restaurant'),
('es', 'La cuenta, por favor', 'The check, please', 'restaurant'),
('es', '¿Tiene mesa para dos?', 'Do you have a table for two?', 'restaurant'),
('es', '¿Qué me recomienda?', 'What do you recommend?', 'restaurant'),
('es', 'Estoy listo para ordenar', 'I am ready to order', 'restaurant'),
('es', '¿Puede traer más agua?', 'Can you bring more water?', 'restaurant'),
-- Airport
('es', '¿Dónde está la puerta de embarque?', 'Where is the boarding gate?', 'airport'),
('es', 'Necesito cambiar mi vuelo', 'I need to change my flight', 'airport'),
('es', '¿Cuál es el número de mi vuelo?', 'What is my flight number?', 'airport'),
('es', '¿Dónde está el equipaje?', 'Where is the baggage?', 'airport'),
('es', 'Tengo una reserva', 'I have a reservation', 'airport'),
-- Hotel
('es', 'Tengo una reserva a nombre de...', 'I have a reservation under the name of...', 'hotel'),
('es', '¿A qué hora es el check-out?', 'What time is check-out?', 'hotel'),
('es', '¿Hay WiFi en la habitación?', 'Is there WiFi in the room?', 'hotel'),
('es', 'Necesito una habitación para esta noche', 'I need a room for tonight', 'hotel'),
-- Small talk
('es', 'Mucho gusto', 'Nice to meet you', 'small_talk'),
('es', '¿Cómo está usted?', 'How are you?', 'small_talk'),
('es', '¿De dónde es usted?', 'Where are you from?', 'small_talk'),
('es', '¿Habla inglés?', 'Do you speak English?', 'small_talk'),
('es', 'No entiendo', 'I don''t understand', 'small_talk'),
('es', '¿Puede repetir, por favor?', 'Can you repeat, please?', 'small_talk');
