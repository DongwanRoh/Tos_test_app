import json
import re

text = """
I got a 20% discount.
They should offer a bigger discount.
They sell cosmetics at a reasonable price.
I earned a lot of membership points.
It is convenient to compare various brands.
They held various promotional events.
They offer free shipping service.
The staff provided excellent customer service.
I usually buy books at a local bookstore.
I can try on clothes in person.
I exchanged it for a new product.
I got a refund for the book.
I returned the t-shirt.
I can shop in one place.
The bag was always sold out.
I waited in line for about an hour.
There is a lot of false information in online advertisements.
I could not afford the bag.
It is convenient to use public transportation in the downtown area.
It is difficult to get medical services in the countryside.
The new office was located in the suburbs.
These days, many people don't talk to their neighbors.
There is a large park in my neighborhood.
There were various amenities in the apartment complex.
I used to live in a studio apartment.
There are not many single-family houses in Korea.
The monthly rent and utility bills were too expensive.
I spent a lot of money on remodeling the house.
My house is close to my office.
I suffered from the noise upstairs.
Many people use digital wallets nowadays.
Many children don't play outside anymore.
I used to take notes by hand in class.
Young people prefer streaming services over TV.
Eco-friendly products are gaining popularity.
Paper books are losing popularity among young people.
The electric car market is growing fast in Korea.
The birth rate is slowing down in Korea.
Cooking at home is becoming trendy again.
More and more people are taking an interest in their health.
Many people travel independently instead of joining package tours.
The number of people living alone is increasing.
I went on a trip to Thailand.
I went on a package tour to China.
He went on a vacation to Spain.
I took a guided tour in Paris.
I travel abroad about once a year.
We don't need travel guidebooks anymore.
I can get to my destination quickly.
I got lost often.
I use a smartphone to find a way.
I visited many tourist attractions in a short time.
We can enjoy a beautiful night view.
I met a lot of locals.
I enjoyed a variety of local foods.
The city was very exotic.
The cost of living was too high.
I was able to save money on travel expenses.
I wasn't very interested in environmental pollution.
I use eco-friendly products such as a reusable bag.
Since then, I usually buy energy-efficient products.
I was able to develop a habit of recycling.
We can reduce air pollution by using electric cars.
We can raise awareness of environmental issues.
We should use fewer disposable products.
We learned how to protect the environment.
By doing so, we can reduce waste.
Water pollution is becoming a serious issue nowadays.
The river was heavily polluted.
They can realize the seriousness of environmental pollution.
We were able to keep our apartment complex clean.
I looked for a job for a year.
Most job seekers prefer large companies.
I prepared for a job interview alone.
He got a job easily.
She entered an education company.
She started an online shopping mall.
She worked overtime almost every day.
She got promoted to the team manager.
He got fired.
She quit the job last month.
I usually go to work by subway.
He often made mistakes while working.
We received many complaints from customers.
He did various tasks alone.
I was late for work often.
He changed jobs last year.
I interned at a start-up company.
Large companies have various employee benefits.
She received a high salary.
The sales increased a lot.
I often went on business trips.
He went on a vacation to London.
I take a walk during lunch break.
My working hours were very long.
We finished the project in time.
We couldn't meet the deadline.
I had a video call every morning.
We can expand our social network at work.
She received an excellent performance evaluation.
Our company hired two experienced employees.
Our company introduced a flexible work system.
It was hard to focus on my studies.
I was under a lot of stress before exams.
Students can relieve stress from studies.
They can be motivated by other students.
I lost interest in studying.
Young children lack self-control.
I often received feedback in class.
I took an online class at home.
I went on a field trip to a museum.
I was able to make many friends in high school.
He got along well with most of the students.
I learned how to cooperate with other students.
Students need to learn the importance of the environment.
Students can learn interpersonal skills at school.
She improved her math skills quickly.
Students can get a better education.
Electronic devices can distract students from studying.
They can develop good study habits.
Students can find their aptitude.
The class helped students choose a career path.
He passed the exam easily.
I wore a school uniform in high school.
I studied at a cram school every day.
I took notes on my iPad.
I did volunteer work once a week.
I could get into a good university.
She majored in accounting.
I commuted to university by bus.
I had a lot of assignments.
The university tuition fee was expensive.
I got good grades on the final exam.
My grades decreased a lot.
He received a full-time scholarship.
I worked part-time during the semesters.
I joined a basketball club.
He studied abroad in England.
I registered for a language school.
She earned various certificates.
We can search for information anytime, anywhere.
We can shop online regardless of location.
I booked a hotel on my smartphone.
I do banking using my smartphone.
We can pay with a smartphone at stores.
We can save time by using the latest technology.
We can check traffic information in real time.
I was able to reserve a seat in advance.
I browse the internet during my break.
In our company, employees work from home regularly.
Many students use AI programs to study efficiently.
Students can ask questions in live online classes.
Smart devices can improve the quality of life.
AI is replacing humans quickly.
Many businesses use social media to promote products.
It is easy to find charging stations for electric cars these days.
I can take notes in a book.
I can get to my destination quickly.
I can try on clothes in person.
I can travel at a low cost.
I can shop on my smartphone.
I can compare various brands.
I can save time on cooking.
I can exercise late at night.
I can avoid wasting money.
I can finish work in time.
I can read books for free.
I can choose books that suit my taste.
We can get help from a trainer.
We can expand our social network at work.
We can enjoy a beautiful night view.
We can shop regardless of time and place.
We can read books in a quiet atmosphere.
We can learn practical skills during internships.
We can work in a comfortable environment.
We can buy music more conveniently.
We can watch exercise videos multiple times.
We can check emails repeatedly.
We can reduce mistakes at work.
We can experience a variety of tasks.
We can adapt to our work quickly.
We can have a financially stable life.
We can enjoy various local foods.
They can be motivated by other students.
They can have a higher quality of education.
They can develop good study habits.
They can be distracted by their smartphones.
Students can make many friends at school.
Students can focus on their studies easily.
Students can find their aptitude.
Students can learn various social skills.
Students can relieve stress from studies.
It was inconvenient to commute.
It is convenient to compare various brands.
It is important to exercise regularly.
It is difficult to focus on studying at home.
It is easy to get job information in a big city.
It is competitive to run a business nowadays.
It is useful to make a shopping list.
It is dangerous to go camping alone.
It is expensive to eat at a hotel restaurant.
It is cheap to use public transportation in Korea.
It is more fun to shop with my friends.
It is uncomfortable to work with strangers.
It is helpful to learn about investing.
There is no famous landmark in my hometown.
There are many smartphone apps for learning.
There are many luxury brands in department stores.
There are many kinds of exercise equipment in fitness centers.
There are many exercise videos on YouTube.
There are too many cars on the street.
There are too many distractions at home.
There are not many bicycle riders in my city.
I need to have healthier eating habits.
I need to keep studying foreign languages.
I need to use my smartphone less.
I need to go to bed early.
We should recycle paper and plastic.
We should not be late for work.
We should exercise regularly.
We should take public transportation more often.
We don't have to hurry while traveling.
We don't have to walk around to go shopping.
We don't have to waste time commuting.
I don't have to worry about noise between floors.
I don't have to go to a bank in person.
I don't have to transfer.
I don't have to work on weekends.
I don't have to discuss with anyone to select a movie.
I don't have to do the dishes after having a meal.
I don't have to spend a lot of money on transportation costs.
I don't have to buy expensive exercise equipment.
I'm interested in experiencing new cultures.
I'm interested in playing musical instruments.
I'm very interested in interior design.
I'm not interested in camping.
I'm not interested in cooking at all.
I was not interested in history.
I was not very interested in startups.
I like taking notes in books.
I like walking along the river.
I like having bread for breakfast.
I like traveling alone.
I like listening to music while working.
I don't like cooking at home.
I don't like eating spicy food.
I don't like studying in the morning.
I was bored during the lecture.
The lecture was boring.
The desks and chairs were comfortable.
It is competitive to run a business in a big city.
We got confused by the new rules.
It is convenient to live in an apartment.
The park was crowded with people.
Many companies prefer creative employees.
He made a detailed plan.
I was disappointed with the service.
The show was disappointing.
I need a durable smartphone.
It is effective in relieving stress.
I received excellent customer service.
The movie was exciting.
We hired an experienced employee.
The lecture was enjoyable.
The trip was really fun.
He often told funny jokes.
We can have healthy eating habits.
His advice was very helpful.
My hometown has many historical places.
She was not interested in studying.
I visited famous local restaurants.
We can have a meal in a luxurious atmosphere.
I think this is a picture of a modern art gallery.
That won't be necessary.
I was very nervous before the interview.
A man is entering an old-looking building.
He was passionate about his job.
He opened a cafe in a popular area.
We can learn practical skills during internships.
There are many professional exercise videos on YouTube.
We can read books in a quiet atmosphere.
The store sells furniture at a reasonable price.
We can work in a relaxed environment.
She was very responsible.
I'm satisfied with my new job.
He made many serious mistakes.
We can have a financially stable life.
My final exam grades were terrible.
I was always tired at school.
We can experience their traditional culture.
The zoo has many unique animals.
The smartphone has many useful functions.
She handled various tasks at work.
Well-known brands provide convenient customer service.
He often skipped meals.
I sometimes stayed up all night.
I usually go for a walk to clear my head.
She rarely talked in the office.
I accidentally spilled coffee on my laptop.
He didn't express his opinion clearly.
They can rest comfortably.
We can shop for groceries conveniently.
She gave the presentation confidently.
Employees can work more creatively.
I don't have to wake up early in the morning.
I went to bed late every day.
We can easily order food on a smartphone.
We worked hard to get a bonus.
We can effectively relieve stress.
We can use our time more efficiently.
He eventually closed the restaurant last year.
She taught the class enjoyably.
Fortunately, we met the deadline.
We can adapt to our work quickly.
We were able to express our opinions freely.
My grades improved gradually.
He reported his mistake honestly.
We can travel more leisurely.
He handled complaints professionally.
I recently moved to a new house.
I exercise regularly to stay healthy.
We can watch the videos repeatedly.
She sincerely listened to students' worries.
Specifically, we can save time on commuting.
We can learn to work systematically.
It takes about two hours to go home.
She is taking notes.
I take a bus twice a day.
The meeting will take place at 10 A.M.
I took an online lecture.
A woman is taking a picture.
I think this picture was taken in a lobby.
A man is taking an order.
I usually take a walk in a park.
They are taking a break at work.
She took out a loan from a bank.
I took a nap for about 30 minutes.
He studied hard to get a job.
I got a high score on the TOEIC.
I got a refund on my shirt.
You can get a $20 discount.
I got feedback often from my teacher.
We can get help from a trainer.
I got disappointed with the result.
He got promoted last year.
He didn't get paid on time.
She got along with everyone.
I got used to my work.
She used social media to do business.
I did an internship at an IT company.
He did a variety of tasks at work.
We can do various exercises at the gym.
He did yoga every day.
I do the grocery shopping online.
I had to do housework alone.
I don't have to do the dishes after eating.
When I was young, I did volunteer work often.
A man is doing an experiment.
I did a team project on AI.
I went on a trip to Sydney with my family.
I went on a package tour to Shanghai.
He went on a vacation to Paris.
I went on a business trip to London.
I go to work by subway.
I go to the movies about once a month.
I often go for a walk in the evening.
I go hiking for exercise.
I usually go shopping on weekends.
A man is going up the stairs.
A boat is going along the river.
The company went bankrupt.
I made many friends at school.
I often made mistakes at work.
I made an investment in a startup company.
I made a reservation online.
The movie made me sad.
He made a good impression on us.
He made a difficult decision.
I made a plan to travel to Japan.
They made an effort to attract customers.
It was difficult to make a profit.
He made a lot of money.
I usually have dinner at home.
They are having a meeting.
I had a lot of assignments.
I had a part-time job at a restaurant.
I have been to Europe.
She had difficulty promoting new products.
A man is having a video call.
I had a chance to study abroad.
I didn't have enough time to study.
He has experience in marketing.
I had an unhealthy lifestyle.
I have a habit of sleeping late.
People have different tastes in fashion.
"""

def normalize(s):
    s = re.sub(r'[^a-zA-Z0-9]', '', s).lower()
    return s

basic_set = set(normalize(line) for line in text.split('\n') if line.strip())

with open('c:/Users/pdwro/My_Project/server/data/sentences.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

match_count = 0
for item in data:
    en_norm = normalize(item['english'])
    if en_norm in basic_set:
        item['difficulty'] = 1
        match_count += 1
    else:
        item['difficulty'] = 2

print(f"Matched {match_count} out of {len(data)} sentences as Basic.")

with open('c:/Users/pdwro/My_Project/server/data/sentences.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
