import styled from "styled-components";

const Card = styled.div.attrs({                                                               
  className: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 transition-all duration-300",                                                                   
})<{ $isHoverable?: boolean }>`                                                               
  ${(props) =>                                                                                
    props.$isHoverable &&                                                                     
    `                                                                                         
    &:hover {                                                                                 
      transform: translateY(-2px);                                                            
      border-color: var(--accent, #a855f7);                                                   
      box-shadow: 0 10px 20px -10px var(--accent-border, rgba(168, 85, 247, 0.3));            
    }                                                                                         
  `}                                                                                          
`; 

export const SettingsPage = () => {                                                                  
      return (                                                                                    
        <div className="text-left">                                                               
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">                  
            Configuración                                                                         
          </h2>                                                                                   
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">                           
            Configura los parámetros globales del sistema.                                        
          </p>                                                                                    
                                                                                                  
          <Card className="max-w-xl">                                                             
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">             
              Ajustes Generales                                                                   
            </h3>                                                                                 
            <div className="space-y-4">                                                           
              <div>                                                                               
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">                                                                                             
                  Nombre del Sitio                                                                
                </label>                                                                          
                <input                                                                            
                  type="text"                                                                     
                  defaultValue="User Manager Dashboard"                                           
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"                                                                                     
                />                                                                                
              </div>                                                                              
            </div>                                                                                
          </Card>                                                                                 
        </div>                                                                                    
      );                                                                                          
    }; 