import React,{useState, useEffect} from "react";
import {useParams,Link} from 'react-router-dom';
import documentService from '../../services/documentService';
import Spinner from '../../component/common/Spinner';
import ChatInterface from '../../component/chat/ChatInterface';
import toast from 'react-hot-toast';
import {ArrowLeft, ExternalLink} from 'lucide-react';
import PageHeader from '../../component/common/PageHeader';
import Tabs from '../../component/common/Tabs';
import AIActions from '../../component/ai/AIActions';
import FlashcardManager from '../../component/Flashcards/FlashcardManager';
import QuizManager from '../../component/quizzes/QuizManager';

const DocumentDetailPage = () => {

  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Content');

  useEffect(() => {
    const fetchDocumentsDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error('Failed to fetch document details.');
        console.error(error);
      } finally {
        setLoading(false);
      }

    };

    fetchDocumentsDetails();
  }, [id]);

  useEffect(() => {
    if (!document?.data?.filepath) {
      setPdfUrl(null);
      return;
    }

    let objectUrl;
    let cancelled = false;

    const fetchPdf = async () => {
      setPdfLoading(true);
      try {
        const blob = await documentService.getDocumentFile(id);
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (error) {
        toast.error('Failed to load document preview.');
        console.error(error);
        if (!cancelled) {
          setPdfUrl(null);
        }
      } finally {
        if (!cancelled) {
          setPdfLoading(false);
        }
      }
    };

    fetchPdf();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id, document?.data?.filepath]);

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }
    if (!document || !document.data || !document.data.filepath) {
      return <div className='text-center p-8'>PDF not available.</div>
    }

    if (pdfLoading || !pdfUrl) {
      return <Spinner />;
    }

  return(
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300">
        <span className="text-sm font-medium text-gray-700">Document Viewer</span>
        <a
        href ={pdfUrl}
        target= "_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          <ExternalLink size={16}/>
          Open in new tab
        </a>
      </div>
      <div className="bg-gray-100 p-1">
        <iframe
          src={pdfUrl}
          className="w-full h-[70vh] bg-white rounded border border-gray-300"
          title="PDF viewer"
        />
      </div>
    </div>
  );
};

const renderChat=()=>{
  return <ChatInterface/>
};

const renderAIActions= ()=>{
  return <AIActions/>
};

const renderFlashcardsTab =()=>{
  return <FlashcardManager documentId={id} />
};

const renderQuizzesTab =()=>{
  return <QuizManager documentId={id}/>
};

const tabs =[
  {name:'Content', label:'Content', content: renderContent()},
  {name:'Chat', label:'Chat', content: renderChat()},
  {name:'AI Actions', label:'AI Actions',content: renderAIActions()},
  {name:'Flashcards', label:'Flashcards',content: renderFlashcardsTab()},
  {name:'Quizzes', label:'Quizzes',content: renderQuizzesTab()},
];

if(loading){
  return <Spinner/>
}
if(!document){
  return <div className="text-center p-8">Document not found.</div>;
}
    return(
      <div>
        <div className="mb-4">
        <Link to='/documents' className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
        <ArrowLeft size={16}/>
        Back to Documents
        </Link>
      </div>
      <PageHeader title={document.data.title}/>
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}/>
      </div>
  );
}
export default DocumentDetailPage;  
