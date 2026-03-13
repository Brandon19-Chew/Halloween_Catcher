# Halloween Item Catcher Game Requirements Document

## 1. Game Overview

### 1.1 Game Name
Halloween Item Catcher

### 1.2 Game Description
A 2D Halloween-themed catching game where players control a character to catch falling items while avoiding dangerous objects.

### 1.3 Game Type
Casual arcade game with scoring, health mechanics, and progressive difficulty levels

## 2. Gameplay Mechanics

### 2.1 Core Gameplay
- Players control a character that can move horizontally to catch falling items
- Items continuously fall from the top of the screen at varying speeds
- Players must catch positive items to gain points while avoiding negative items that reduce health

### 2.2 Character Control
- Character can move left and right to position under falling items
- Character catches items by making contact with them
- Character position adjusted to prevent going too low on screen

### 2.3 Item Types and Effects

**Positive Items (Score Points):**
- Candy: +2 points
- Pumpkin: +5 points
- Glow green jar: +7 points
- Cake: +10 points

**Negative Items (Health Deduction):**
- Bomb: -5 health
- Knife: -10 health

### 2.4 Health System
- Character starts with a default health value
- Health decreases when catching bombs or knives
- Game ends when health reaches zero
- HP display color is green

### 2.5 Scoring System
- Score increases based on the type of positive item caught
- Score is displayed during gameplay
- Scoreboard displays player rankings

### 2.6 Level System
- Each level requires 50 points to advance
- When player reaches 50 points, level increases by 1
- Item falling speed increases with each level progression
- Number of falling items increases with each level progression
- Level number is displayed during gameplay

### 2.7 Size Adjustments
- Character size reduced to smaller scale
- All item sizes (candy, pumpkin, glow green jar, cake, bomb, knife) reduced to smaller scale

## 3. Visual Theme

### 3.1 Environment
- Halloween theme and environment throughout the game
- Appropriate Halloween-themed visual elements and atmosphere
- Animated background to enhance visual appeal and immersion

### 3.2 Game Elements
- Character design fits Halloween theme
- All items (candy, pumpkin, glow green jar, cake, bomb, knife) have Halloween-style visuals

## 4. Game Settings

### 4.1 Description Tutorial
- Provide game description and tutorial in the settings
- Explain gameplay mechanics, controls, and item effects
- Help players understand how to play the game

## 5. Player Name Entry

### 5.1 Name Input
- Before starting the game, players must enter their name
- Name entry is required to proceed to gameplay
- Player name is used for scoreboard display

## 6. Scoreboard

### 6.1 Score Display
- Scoreboard displays player rankings based on scores
- Shows player names and their corresponding scores
- Accessible for viewing player performance

## 7. Game Display

### 7.1 Framework Width
- The game framework should be displayed in full width
- Game canvas expands to utilize the full available width of the screen

## 8. Game Flow

### 8.1 Game Start
- Player enters name before starting
- Game begins with character positioned at the bottom of the screen
- Starting level is 1
- Items start falling immediately

### 8.2 During Gameplay
- Continuous item spawning and falling
- Real-time score, health, and level display
- Falling speed and number of items increase when advancing to next level

### 8.3 Game End
- Game ends when character's health reaches zero
- Final score and level reached are displayed
- Score is recorded on the scoreboard with player name