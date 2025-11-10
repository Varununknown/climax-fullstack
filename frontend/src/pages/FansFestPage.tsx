import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import API from '../services/api';import { useParams, useNavigate } from 'react-router-dom';import { useParams, useNavigate } from 'react-router-dom';



export const FansFestPage: React.FC = () => {import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

  const { contentId } = useParams<{ contentId: string }>();

  const navigate = useNavigate();import { useAuth } from '../context/AuthContext';import API from '../services/api';

  const [data, setData] = useState<any>(null);

  const [loading, setLoading] = useState(true);import API from '../services/api';

  const [error, setError] = useState<string>('');

// NEW FANS FEST PAGE - 2025-11-10 - Fresh implementation to bypass cache

  useEffect(() => {

    console.log('🎪 SIMPLE FANS FEST TEST PAGE');export const FansFestPage: React.FC = () => {

    console.log('🎪 Content ID:', contentId);

      const { contentId } = useParams<{ contentId: string }>();interface Question {

    if (!contentId) {

      navigate('/');  const navigate = useNavigate();  _id: string;

      return;

    }  const { user } = useAuth();  questionText: string;

    

    const testAPI = async () => {  options: string[];

      try {

        console.log('🎪 Testing API call...');  const [fansFestData, setFansFestData] = useState<any>(null);}

        const response = await API.get(`/participation/user/${contentId}/questions`);

        console.log('🎪 API Response:', response);  const [loading, setLoading] = useState<boolean>(true);

        console.log('🎪 Response data:', response.data);

          const [submitting, setSubmitting] = useState<boolean>(false);interface FansFestData {

        if (response.data?.success && response.data?.data?.questions) {

          console.log('✅ SUCCESS! Questions found:', response.data.data.questions.length);  const [answers, setAnswers] = useState<Record<string, string>>({});  content: {

          setData(response.data.data);

        } else {  const [submitted, setSubmitted] = useState<boolean>(false);    _id: string;

          console.log('❌ No questions in response');

          setError('No questions found');  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });    title: string;

        }

      } catch (err: any) {    image: string;

        console.error('❌ API Error:', err);

        console.error('❌ Error response:', err.response);  useEffect(() => {  };

        setError('API Error: ' + err.message);

      } finally {    console.log('🎪 NEW FANS FEST PAGE LOADED - contentId:', contentId);  settings: {

        setLoading(false);

      }    if (!contentId) {    isPaid: boolean;

    };

          navigate('/');    pricePerParticipation: number;

    testAPI();

  }, [contentId]);      return;    isActive: boolean;



  if (loading) {    }  };

    return (

      <div className="min-h-screen bg-gray-900 text-white p-8">    fetchFansFestData();  questions: Question[];

        <h1 className="text-3xl mb-4">🎪 Simple Fans Fest Test</h1>

        <p>Loading...</p>  }, [contentId]);}

      </div>

    );

  }

  const fetchFansFestData = async () => {export const FansFestPage: React.FC = () => {

  return (

    <div className="min-h-screen bg-gray-900 text-white p-8">    try {  const { contentId } = useParams<{ contentId: string }>();

      <button 

        onClick={() => navigate(-1)}      setLoading(true);  const navigate = useNavigate();

        className="mb-4 bg-red-600 px-4 py-2 rounded"

      >      console.log('🎪 Fetching Fans Fest data for:', contentId);  

        ← Back

      </button>        const [fest, setFest] = useState<FansFest | null>(null);

      

      <h1 className="text-3xl mb-4">🎪 Simple Fans Fest Test</h1>      const response = await API.get(`/participation/user/${contentId}/questions`);  const [answers, setAnswers] = useState<{ [key: number]: number }>({});

      <p className="mb-4">Content ID: {contentId}</p>

            const data = response.data;  const [loading, setLoading] = useState(true);

      {error ? (

        <div className="bg-red-500/20 border border-red-500 p-4 rounded mb-4">        const [submitted, setSubmitted] = useState(false);

          <p>Error: {error}</p>

        </div>      console.log('🎪 API Response:', data);  const [score, setScore] = useState(0);

      ) : (

        <div className="bg-green-500/20 border border-green-500 p-4 rounded mb-4">  const [message, setMessage] = useState('');

          <p>✅ API Working! Questions found: {data?.questions?.length || 0}</p>

        </div>      if (data.success && data.data?.questions?.length > 0) {

      )}

              console.log('✅ Questions found:', data.data.questions.length);  useEffect(() => {

      {data?.questions && (

        <div className="mt-6">        setFansFestData(data.data);    fetchFest();

          <h2 className="text-xl mb-4">Questions:</h2>

          {data.questions.map((q: any, i: number) => (        setMessage({ type: 'success', text: `${data.data.questions.length} questions loaded!` });  }, [contentId]);

            <div key={i} className="bg-gray-800 p-4 rounded mb-4">

              <p className="font-bold">Q{i+1}: {q.questionText}</p>      } else {

              <p className="text-gray-400">Options: {q.options?.join(', ')}</p>

            </div>        console.log('❌ No questions found');  const fetchFest = async () => {

          ))}

        </div>        setMessage({ type: 'error', text: 'No Fans Fest questions available yet!' });    try {

      )}

            }      const response = await API.get(`/participation/user/${contentId}/questions`);

      <div className="mt-8 p-4 bg-gray-800 rounded">

        <h3 className="text-lg mb-2">Debug Info:</h3>    } catch (error: any) {      const data = response.data;

        <pre className="text-xs text-green-400 overflow-auto">

          {JSON.stringify(data, null, 2)}      console.error('❌ Error:', error);      

        </pre>

      </div>      setMessage({ type: 'error', text: 'Failed to load questions' });      if (data.success && data.questions && data.questions.length > 0) {

    </div>

  );    } finally {        setFest({

};
      setLoading(false);          contentId: contentId!,

    }          contentName: data.contentName || 'Fans Fest',

  };          questions: data.questions,

          isPaid: data.isPaid || false

  const handleAnswerSelect = (questionId: string, selectedOption: string) => {        });

    console.log('Selected:', questionId, selectedOption);      } else {

    setAnswers({        setMessage('No questions available for this content yet!');

      ...answers,      }

      [questionId]: selectedOption    } catch (err) {

    });      setMessage('Error loading Fans Fest');

  };    } finally {

      setLoading(false);

  const handleSubmit = async () => {    }

    if (!fansFestData) return;  };



    const unansweredQuestions = fansFestData.questions.filter((q: any) => !answers[q._id]);  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {

    if (unansweredQuestions.length > 0) {    setAnswers({

      setMessage({ type: 'error', text: 'Please answer all questions' });      ...answers,

      return;      [questionIndex]: optionIndex

    }    });

  };

    setSubmitting(true);

    try {  const handleSubmit = async () => {

      console.log('📤 Submitting answers:', answers);    if (!fest || Object.keys(answers).length !== fest.questions.length) {

      setMessage('Please answer all questions!');

      const submissionData = fansFestData.questions.map((q: any) => ({      return;

        questionId: q._id,    }

        selectedOption: answers[q._id]

      }));    try {

      const response = await API.post(`/participation/user/${contentId}/submit`, { answers });

      const response = await API.post(`/participation/user/${contentId}/submit`, {      const data = response.data;

        answers: submissionData      

      });      if (data.success) {

        setScore(data.score);

      console.log('✅ Submission response:', response.data);        setSubmitted(true);

        setMessage(`Amazing! You scored ${data.score}/${fest.questions.length}! 🎉`);

      if (response.data.success) {      }

        setSubmitted(true);    } catch (err) {

        setMessage({ type: 'success', text: '🎉 Submitted successfully!' });      setMessage('Error submitting answers');

      }    }

    } catch (error: any) {  };

      console.error('❌ Submit error:', error);

      setMessage({ type: 'error', text: 'Failed to submit' });  if (loading) {

    } finally {    return (

      setSubmitting(false);      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 flex items-center justify-center">

    }        <div className="text-white text-2xl animate-pulse">Loading Fans Fest...</div>

  };      </div>

    );

  // Loading state  }

  if (loading) {

    return (  if (!fest) {

      <div className="min-h-screen bg-gray-900 flex items-center justify-center">    return (

        <div className="text-center">      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 flex items-center justify-center">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>        <div className="text-center">

          <p className="text-white">Loading Fans Fest...</p>          <div className="text-white text-2xl mb-4">{message || 'No questions available'}</div>

        </div>          <button onClick={() => navigate(-1)} className="bg-white text-purple-900 px-6 py-2 rounded-full font-bold hover:bg-gray-100">

      </div>            Go Back

    );          </button>

  }        </div>

      </div>

  // Success state    );

  if (submitted) {  }

    return (

      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">  if (submitted) {

        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">    return (

          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 flex items-center justify-center p-4">

          <h2 className="text-xl font-bold text-white mb-4">Success!</h2>        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 text-center shadow-2xl">

          <p className="text-gray-300 mb-6">Your Fans Fest participation has been submitted!</p>          <div className="mb-6">

          <button            <Trophy className="w-24 h-24 mx-auto text-yellow-500 animate-bounce" />

            onClick={() => navigate('/')}          </div>

            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"          <h1 className="text-4xl font-bold text-purple-900 mb-4">Congratulations! 🎊</h1>

          >          <p className="text-2xl text-gray-700 mb-2">{message}</p>

            Back to Home          <div className="text-6xl font-bold text-purple-600 my-8">

          </button>            {score}/{fest.questions.length}

        </div>          </div>

      </div>          <p className="text-gray-600 mb-8">Your answers have been recorded. Check back for rewards!</p>

    );          <button

  }            onClick={() => navigate(-1)}

            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"

  // Error state          >

  if (!fansFestData) {            Back to Content

    return (          </button>

      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">        </div>

        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">      </div>

          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />    );

          <h2 className="text-xl font-bold text-white mb-4">No Questions Available</h2>  }

          <p className="text-gray-300 mb-6">{message.text}</p>

          <button  return (

            onClick={() => navigate(-1)}    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 p-4">

            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto"      {/* Header */}

          >      <div className="max-w-4xl mx-auto mb-8">

            <ArrowLeft className="h-4 w-4" />        <button onClick={() => navigate(-1)} className="text-white mb-4 flex items-center gap-2 hover:underline">

            Go Back          <ArrowLeft size={20} />

          </button>          Back

        </div>        </button>

      </div>        

    );        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 text-center">

  }          <div className="flex items-center justify-center gap-3 mb-2">

            <Sparkles className="text-yellow-300" size={32} />

  // Main content            <h1 className="text-4xl font-bold text-white">Fans Fest</h1>

  return (            <Star className="text-yellow-300" size={32} />

    <div className="min-h-screen bg-gray-900 p-4">          </div>

      <div className="max-w-4xl mx-auto">          <p className="text-white/90 text-lg">{fest.contentName}</p>

        {/* Header */}          <p className="text-white/70 mt-2">Answer all questions and win exciting rewards!</p>

        <div className="flex items-center mb-6">        </div>

          <button      </div>

            onClick={() => navigate(-1)}

            className="text-white hover:text-red-500 mr-4"      {/* Questions */}

          >      <div className="max-w-4xl mx-auto space-y-6">

            <ArrowLeft className="h-6 w-6" />        {fest.questions.map((question, qIndex) => (

          </button>          <div key={qIndex} className="bg-white rounded-2xl p-6 shadow-xl">

          <div>            <div className="mb-4">

            <h1 className="text-2xl font-bold text-white">🎪 Fans Fest</h1>              <span className="inline-block bg-purple-100 text-purple-800 px-4 py-1 rounded-full text-sm font-semibold mb-2">

            <p className="text-gray-400">{fansFestData?.content?.title}</p>                Question {qIndex + 1} of {fest.questions.length}

          </div>              </span>

        </div>              <h3 className="text-xl font-bold text-gray-800">{question.questionText}</h3>

            </div>

        {/* Message */}

        {message.text && (            <div className="space-y-3">

          <div className={`p-4 rounded-lg mb-6 ${              {question.options.map((option, oIndex) => (

            message.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'                <button

          }`}>                  key={oIndex}

            {message.text}                  onClick={() => handleAnswerSelect(qIndex, oIndex)}

          </div>                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${

        )}                    answers[qIndex] === oIndex

                      ? 'border-purple-600 bg-purple-50 shadow-lg scale-105'

        {/* Questions */}                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'

        <div className="bg-gray-800 rounded-lg p-6">                  }`}

          <h2 className="text-xl font-semibold text-white mb-6">                >

            Questions ({fansFestData?.questions?.length || 0})                  <div className="flex items-center gap-3">

          </h2>                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${

                      answers[qIndex] === oIndex ? 'border-purple-600 bg-purple-600' : 'border-gray-300'

          {fansFestData?.questions?.map((question: any, index: number) => (                    }`}>

            <div key={question._id} className="mb-8">                      {answers[qIndex] === oIndex && <div className="w-3 h-3 bg-white rounded-full" />}

              <h3 className="text-lg font-medium text-white mb-4">                    </div>

                {index + 1}. {question.questionText}                    <span className="text-gray-800 font-medium">{option}</span>

              </h3>                  </div>

                              </button>

              <div className="space-y-3">              ))}

                {question.options?.map((option: string, optionIndex: number) => (            </div>

                  <label          </div>

                    key={optionIndex}        ))}

                    className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"

                  >        {/* Submit Button */}

                    <input        <div className="bg-white rounded-2xl p-6 shadow-xl text-center">

                      type="radio"          <p className="text-gray-600 mb-4">

                      name={`question-${question._id}`}            Answered: {Object.keys(answers).length}/{fest.questions.length}

                      value={option}          </p>

                      checked={answers[question._id] === option}          {message && (

                      onChange={() => handleAnswerSelect(question._id, option)}            <p className="text-red-600 mb-4">{message}</p>

                      className="mr-3 text-red-600"          )}

                    />          <button

                    <span className="text-white">{option}</span>            onClick={handleSubmit}

                  </label>            disabled={Object.keys(answers).length !== fest.questions.length}

                ))}            className={`px-12 py-4 rounded-full font-bold text-lg transition-all ${

              </div>              Object.keys(answers).length === fest.questions.length

            </div>                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 shadow-lg'

          ))}                : 'bg-gray-300 text-gray-500 cursor-not-allowed'

            }`}

          {/* Submit Button */}          >

          <div className="mt-8 text-center">            Submit Answers 🎁

            <button          </button>

              onClick={handleSubmit}        </div>

              disabled={submitting || !fansFestData?.questions?.every((q: any) => answers[q._id])}      </div>

              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed font-semibold"    </div>

            >  );

              {submitting ? 'Submitting...' : 'Submit Participation'}};

            </button>
          </div>
        </div>
      </div>
    </div>
  );
};