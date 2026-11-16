
import { useState } from 'react';
import { Star } from 'lucide-react';

const projects = [
  '3li Salon – Nugegoda',
  'Summer 67',
  'Giftora Lush',
  'HNB Nallur Festival',
  'HNB Awurudu 2026 – ITN',
  'Pan Asia Bank – TV Commercials',
  'Shervin Events',
  'Airtel Sri Lanka – TV Commercials',
  'Adaraneeya Tharuwak – Film Premiere',
  'Manamala Katha – Song Premiere',
  'Thinking Bird Productions',
  "ROTA FIESTA '26 – KDU",
];

function RatingStars({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-3 my-5" role="group" aria-label="Choose a star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} stars`}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={30}
            fill={star <= value ? '#D5B982' : 'transparent'}
            color="#D5B982"
          />
        </button>
      ))}
    </div>
  );
}

export function RatingsSection() {
  const [type, setType] = useState<'studio' | 'project'>('studio');
  const [rating, setRating] = useState(0);
  const [project, setProject] = useState('');
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState('');

  return (
    <section
      id="ratings"
      className="bg-[#171717] border-t border-[#292522] px-5 sm:px-8 py-24"
    >
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs tracking-[0.26em] text-[#D5B982] uppercase">
          YOUR FEEDBACK MATTERS
        </p>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl text-[#F4EFE6] uppercase">
          RATE YOUR EXPERIENCE
        </h2>
        <p className="mt-4 text-sm text-[#888078]">
          Your feedback helps SF Creations grow and create better experiences.
        </p>

        <div className="flex justify-center gap-3 mt-10">
          <button
            type="button"
            onClick={() => { setType('studio'); setRating(0); }}
            className={`px-5 py-3 text-xs tracking-widest uppercase border ${
              type === 'studio'
                ? 'bg-[#D5B982] text-[#171717] border-[#D5B982]'
                : 'border-[#D5B982]/40 text-[#F4EFE6]'
            }`}
          >
            Rate the Studio
          </button>
          <button
            type="button"
            onClick={() => { setType('project'); setRating(0); }}
            className={`px-5 py-3 text-xs tracking-widest uppercase border ${
              type === 'project'
                ? 'bg-[#D5B982] text-[#171717] border-[#D5B982]'
                : 'border-[#D5B982]/40 text-[#F4EFE6]'
            }`}
          >
            Rate a Project
          </button>
        </div>

        <form
          action="https://formsubmit.co/sfcreations26@gmail.com"
          method="POST"
          className="mt-10 text-left border border-[#292522] bg-[#1C1A19] p-7 sm:p-10"
        >
          <input type="hidden" name="_subject" value="New SF Creations Client Rating" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="Rating Type" value={type === 'studio' ? 'Overall Studio Rating' : 'Individual Project Rating'} />
          <input type="hidden" name="Star Rating" value={`${rating} out of 5`} />

          {type === 'project' && (
            <label className="block mb-6 text-xs tracking-widest text-[#D5B982] uppercase">
              Select Project
              <select
                required
                name="Project"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="mt-3 w-full bg-[#171717] border border-[#D5B982]/30 p-4 text-sm text-[#F4EFE6] normal-case tracking-normal"
              >
                <option value="">Choose a project</option>
                {projects.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          )}

          <p className="text-xs tracking-widest text-[#D5B982] uppercase">
            {type === 'studio' ? 'How was your overall experience?' : 'How would you rate this project?'}
          </p>
          <div className="flex justify-center">
            <RatingStars value={rating} onChange={setRating} />
          </div>
          <input
            type="hidden"
            name="_rating_check"
            value={rating > 0 ? 'Rating selected' : ''}
          />

          <label className="block mt-5 text-xs tracking-widest text-[#D5B982] uppercase">
            Your Name
            <input
              required
              name="Client Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="mt-3 w-full bg-[#171717] border border-[#D5B982]/30 p-4 text-sm text-[#F4EFE6] normal-case tracking-normal"
            />
          </label>

          <label className="block mt-6 text-xs tracking-widest text-[#D5B982] uppercase">
            Share Your Feedback
            <textarea
              required
              name="Feedback"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              className="mt-3 w-full bg-[#171717] border border-[#D5B982]/30 p-4 text-sm text-[#F4EFE6] normal-case tracking-normal"
            />
          </label>

          <button
            type="submit"
            disabled={rating === 0 || (type === 'project' && !project)}
            className="mt-7 w-full bg-[#D5B982] text-[#171717] py-4 text-xs font-semibold tracking-[0.2em] uppercase disabled:opacity-40"
          >
            Submit Your Rating
          </button>
          <p className="text-center text-[11px] text-[#888078] mt-4">
            Thank you for supporting SF Creations.
          </p>
        </form>
      </div>
    </section>
  );
}
