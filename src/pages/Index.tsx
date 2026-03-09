/**
 * Index Page
 * Entry point for Netral Apps - shows launcher and mode switching
 */

import { NetralApp } from '@/apps/NetralApp';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Netral - Create websites and presentations</title>
        <meta name="description" content="Netral is a suite of tools to create websites, presentations and documents with simple, intuitive syntax." />
      </Helmet>
      <NetralApp />
    </>
  );
};

export default Index;
