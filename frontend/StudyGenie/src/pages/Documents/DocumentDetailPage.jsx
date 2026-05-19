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
const DocumentDetailPage= ()=>{

  const {id} =useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab]= useState('Content');

  useEffect(()=>{
    const fetchDocumentDetails = async () =>{
      try{
        const data = await documentService.getDocumentById(id);
        setDocument((data));
      }catch(error){
        toast.error('failed to fetch document details');
        console.error('Failed to fetch document details', error);
      }finally{
        setLoading(false);
      }
    }; 
  fetchDocumentDetails();
},
[id]);
//Helper function to get the PDF url
const getPDFUrl =()=>{
  if(!document?.data?.filepath) return null;

  const filePath = document.data.filepath;

  if(filePath.startsWith('http://')|| filePath.startsWith('https://')){
    return filePath;
  }

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}${filePath.startsWith('/') ? '':'/'}${filePath}`;
};
 
const renderContent =()=>{
  if(loading){
    return <Spinner/>
  }
  if(!document || !document.data ||!document.data.filepath){
    return <div className="text-center p-8">PDF not available.</div>
  }

  const PdfUrl =getPDFUrl();

  return(
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300">
        <span className="text-sm font-medium text-gray-700">Document Viewer</span>
        <a
        href ={PdfUrl}
        target= "_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          <ExternalLink size={16}/>
          Open in new tab
        </a>
      </div>
      <div className="bg-gray-100 p-1">
        <iframe 
        src={PdfUrl}
        className="w-full h-[70vh] bg-white rounded border border-gray-300"
        title="PDF viewer"
        frameBorder="0"
        style={{
          colorSchema:'light',
        }}/>
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
